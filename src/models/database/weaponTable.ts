import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { PerkTable } from "../../services/weaponDbService";
import { WeaponArchetype } from "../destiny-entities/weaponArchetype";

export interface DestinyInventoryItemDefinitionRecord {
  hash: string;
  name?: string;
  data: DestinyInventoryItemDefinition;
}

export type PerkDBTables = Record<PerkTable, PerkWeaponMapping | undefined>;

export type PerkWeaponMapping = {
  [hash: string]: [name: string, weaponHashes: Set<string>];
};

export type PerkRecord = {
  name: string;
  weaponHash: string;
};

export type ArchetypeWeaponMapping = {
  [hash: string]: WeaponArchetype;
};
