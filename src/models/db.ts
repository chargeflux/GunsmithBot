import {
  DestinyDefinitionFrom,
  DestinyManifestComponentName,
} from "bungie-api-ts/destiny2";

export class DBTableRecord {
  hash: string;
  name?: string;
  json: DestinyDefinitionFrom<DestinyManifestComponentName>;

  constructor(
    hash: string,
    json: DestinyDefinitionFrom<DestinyManifestComponentName>
  ) {
    this.hash = hash;
    if ("displayProperties" in json) this.name = json.displayProperties.name;
    this.json = json;
  }
}

export interface DBTableRecordJSON {
  json: string;
}
