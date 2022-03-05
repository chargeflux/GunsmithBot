import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { BaseMetadata } from "./base-metadata";
import { BUNGIE_URL_ROOT } from "../constants";
import Perk from "./perk";
import { ArmorArchetypeData, ArmorBaseArchetype } from "./armor-base-archetype";

export class Armor implements BaseMetadata {
  name: string;
  flavorText: string;
  icon: string;
  screenshot: string;
  hash: number;
  powerCapValues?: number[];
  baseArchetype?: ArmorBaseArchetype;
  source: string;

  constructor(
    rawArmorData: DestinyInventoryItemDefinition,
    powerCapValues: number[],
    source: string,
    intrinsic?: Perk
  ) {
    this.name = rawArmorData.displayProperties.name;
    this.flavorText = rawArmorData.flavorText;
    this.screenshot = BUNGIE_URL_ROOT + rawArmorData.screenshot;
    this.icon = BUNGIE_URL_ROOT + rawArmorData.displayProperties.icon;
    this.hash = rawArmorData.hash;
    this.source = source.replace("Source: ", "");

    const itemCategoryHashes = rawArmorData.itemCategoryHashes ?? [];
    const tierTypeHash = rawArmorData.inventory?.tierTypeHash;

    const archetypeData = new ArmorArchetypeData(
      this.name,
      powerCapValues,
      itemCategoryHashes,
      tierTypeHash
    );

    this.setBaseArchetype(ArmorBaseArchetype.create(archetypeData, intrinsic));
  }

  setPowerCapValues(powerCapValues: number[]) {
    this.powerCapValues = powerCapValues;
  }

  setBaseArchetype(baseArchetype: ArmorBaseArchetype) {
    this.baseArchetype = baseArchetype;
  }
}
