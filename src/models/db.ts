import {
  DestinyDefinitionFrom,
  DestinyInventoryItemDefinition, DestinyManifestComponentName
} from "bungie-api-ts/destiny2";
import { WeaponTable } from "../services/weapon-db-service";

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

export interface DBTableRecordResult {
  hash: string;
  name?: string;
  json: string;
}

export interface DBTableRecordResultAllWeaponsParsed {
  hash: string;
  name?: string;
  data: DestinyInventoryItemDefinition;
}

export type DBTableRecordJSON = {
  json: string;
};

export type WeaponDBTable = Record<
  WeaponTable,
  WeaponDBTableRecord | undefined
>;

export type WeaponDBTableRecord = {
  [hash: string]: [name: string, weaponHashIds: Set<string>];
};

export type WeaponDBTableRecordResult = {
  weaponHashIds: string;
};

export type WeaponDBTableRecordNameResult = {
  name: string;
};
