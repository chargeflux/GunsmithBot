import {
  DestinyDefinitionFrom,
  DestinyInventoryItemDefinition,
  DestinyManifestComponentName,
} from "bungie-api-ts/destiny2";
import { WeaponTable } from "../services/weaponDbService";

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

export type ManifestTableRecordJSON = {
  json: string;
};

export interface DestinyInventoryItemDefinitionRecord {
  hash: string;
  name?: string;
  data: DestinyInventoryItemDefinition;
}

export type WeaponDBTables = Record<WeaponTable, PerkWeaponHashMap | undefined>;

export type PerkWeaponHashMap = {
  [hash: string]: [name: string, weaponHashIds: Set<string>];
};

export type PerkRecord = {
  name: string;
  weaponHashIds: string;
};
