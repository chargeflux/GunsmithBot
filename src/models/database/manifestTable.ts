import { DestinyDefinitionFrom, DestinyManifestComponentName } from "bungie-api-ts/destiny2";

export class ManifestTable {
  name: DestinyManifestComponentName;
  data: ManifestTableRecord[];

  constructor(
    name: DestinyManifestComponentName,
    input: DestinyDefinitionFrom<DestinyManifestComponentName>[]
  ) {
    this.name = name;
    this.data = this.convertToRecords(input);
  }

  private convertToRecords(
    data: DestinyDefinitionFrom<DestinyManifestComponentName>[]
  ): ManifestTableRecord[] {
    const dbTableRecords: ManifestTableRecord[] = [];
    for (const k in data) {
      dbTableRecords.push(new ManifestTableRecord(data[k].hash.toString(), data[k]));
    }
    return dbTableRecords;
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
