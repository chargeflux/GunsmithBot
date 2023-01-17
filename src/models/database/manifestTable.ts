import { DestinyDefinitionFrom, DestinyManifestComponentName } from "bungie-api-ts/destiny2";
import fs from "fs";
import streamObject from "stream-json/streamers/StreamObject";
import Batch from "stream-json/utils/Batch";

export class ManifestTable {
  name: DestinyManifestComponentName;
  data: DestinyDefinitionFrom<DestinyManifestComponentName>[] | string;
  lazy: boolean;

  constructor(
    name: DestinyManifestComponentName,
    input: DestinyDefinitionFrom<DestinyManifestComponentName>[] | string,
    lazy = false
  ) {
    this.name = name;
    this.lazy = lazy;
    this.data = input;
  }

  public GetData() {
    if (!this.lazy && typeof this.data != "string") {
      const records: ManifestTableRecord[] = [];
      for (const k in this.data) {
        records.push(new ManifestTableRecord(this.data[k].hash.toString(), this.data[k]));
      }
      return records;
    } else {
      throw new Error("data is lazy loaded only");
    }
  }

  public LoadData(parse: (arg0: ManifestTableRecord[]) => void): Promise<void> {
    if (this.lazy && typeof this.data == "string") {
      return this.GetManifestTable(this.data, parse);
    } else {
      throw new Error("data is not lazy loaded");
    }
  }

  GetManifestTable(path: string, parse: (arg0: ManifestTableRecord[]) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(path);
      stream
        .pipe(streamObject.withParser())
        .pipe(new Batch({ batchSize: 10000 }))
        .on("data", (data) =>
          parse(
            data.map(
              (x: { key: string; value: DestinyDefinitionFrom<DestinyManifestComponentName> }) =>
                new ManifestTableRecord(x.key, x.value)
            )
          )
        )
        .on("error", (error) => reject(error))
        .on("finish", () => resolve());
    });
  }
}

export type ManifestTableRecordJSON = {
  json: string;
};

export class ManifestTableRecord {
  hash: string;
  name?: string;
  json: DestinyDefinitionFrom<DestinyManifestComponentName> | string;

  constructor(hash: string, json: DestinyDefinitionFrom<DestinyManifestComponentName>) {
    this.hash = hash;
    if ("displayProperties" in json) this.name = json.displayProperties.name;
    this.json = json;
  }
}
