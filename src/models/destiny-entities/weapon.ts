import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { BaseMetadata } from "./baseMetadata";
import WeaponOptions from "../command-options/weaponOptions";
import {
  BUNGIE_URL_ROOT,
  CRAFTED_ICON_URL,
  EVENT_WATERMARK,
  UNKNOWN_SEASON_WATERMARK,
  WATERMARK_TO_SEASON_NUMBER,
} from "../constants";
import Perk from "./perk";
import Socket from "./socket";
import { WeaponArchetypeData, WeaponArchetype } from "./weaponArchetype";
import WeaponStats from "./weaponStats";
import { getImageBuffer, overlayImages } from "../../utils/utils";
import PublicError from "../errors/publicError";
import { logger } from "../../logger";

const _logger = logger.getSubLogger({ name: "Weapon" });

export class Weapon implements BaseMetadata {
  name: string;
  flavorText: string;
  icon: string;
  overlays: string[] = [];
  screenshot: string;
  hasRandomRolls: boolean;
  craftable: boolean;
  seasonNumber: number;
  hash: number;
  index: number;
  stats?: WeaponStats;
  powerCapValues?: number[];
  archetype: WeaponArchetype;
  sockets: Socket[] = [];
  options: WeaponOptions;

  constructor(
    rawWeaponData: DestinyInventoryItemDefinition,
    options: WeaponOptions,
    powerCapValues: number[],
    sockets: Socket[],
    intrinsic?: Perk
  ) {
    this.name = rawWeaponData.displayProperties.name;
    this.flavorText = rawWeaponData.flavorText;
    this.screenshot = BUNGIE_URL_ROOT + rawWeaponData.screenshot;
    this.icon = BUNGIE_URL_ROOT + rawWeaponData.displayProperties.icon;
    this.hasRandomRolls = rawWeaponData.displaySource != "";
    this.hash = rawWeaponData.hash;
    this.index = rawWeaponData.index;
    this.seasonNumber = this.determineSeasonNumber(rawWeaponData);
    this.craftable = typeof rawWeaponData.inventory?.recipeItemHash === "number";

    this.options = options;
    if (!this.options.isDefault) {
      if (rawWeaponData.stats) this.stats = new WeaponStats(this.name, rawWeaponData.stats);
      else throw Error("Stats for weapon are missing: " + this.name);
    }

    const itemCategoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    const weaponTierTypeHash = rawWeaponData.inventory?.tierTypeHash;
    const weaponDamageTypeId = rawWeaponData.defaultDamageType;

    const archetypeData = new WeaponArchetypeData(
      this.name,
      powerCapValues,
      itemCategoryHashes,
      weaponDamageTypeId,
      rawWeaponData.itemTypeDisplayName,
      weaponTierTypeHash,
      rawWeaponData.inventory?.recipeItemHash
    );

    this.archetype = WeaponArchetype.create(archetypeData, intrinsic);

    this.overlays.push(
      BUNGIE_URL_ROOT +
      (this.archetype.powerCap != 0
        ? rawWeaponData.iconWatermarkShelved
        : rawWeaponData.iconWatermark)
    );
    if (this.craftable) {
      this.overlays.push(CRAFTED_ICON_URL);
    }

    this.setSockets(sockets);
  }

  determineSeasonNumber(rawWeaponData: DestinyInventoryItemDefinition): number {
    const seasonNumber =
      WATERMARK_TO_SEASON_NUMBER[
      rawWeaponData.iconWatermark ?? rawWeaponData.quality?.displayVersionWatermarkIcons[0]
      ] ?? -1;
    if (
      seasonNumber === -1 &&
      !EVENT_WATERMARK.includes(rawWeaponData.iconWatermark) &&
      rawWeaponData.iconWatermark != UNKNOWN_SEASON_WATERMARK
    ) {
      _logger.error(`Unknown season watermark URL: ${rawWeaponData.iconWatermark}`)
      throw new PublicError("Fatal: Failed to parse season number");
    }
    return seasonNumber;
  }

  setPowerCapValues(powerCapValues: number[]) {
    this.powerCapValues = powerCapValues;
  }

  setSockets(sockets: Socket[]) {
    this.sockets = sockets;
  }

  async getThumbnail() {
    const bufs: Buffer[] = [await getImageBuffer(this.icon)];
    for (const url of this.overlays) {
      const buf = await getImageBuffer(url);
      bufs.push(buf);
    }
    const final_icon = await overlayImages(bufs);
    return final_icon;
  }
}
