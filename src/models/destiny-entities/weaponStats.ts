import {
  DestinyInventoryItemStatDefinition,
  DestinyItemStatBlockDefinition,
} from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { StatOrder, WeaponStat } from "../constants";
import { BaseDestinyItem } from "./baseMetadata";
const _logger = logger.getSubLogger({ name: "Weapon.Stats" });

export default class WeaponStats implements BaseDestinyItem {
  name: string;
  stats: WeaponStatBlock[];

  constructor(name: string, weaponStatData: DestinyItemStatBlockDefinition) {
    this.name = name;
    this.stats = this.processStats(weaponStatData);
  }

  processStats(statsData: DestinyItemStatBlockDefinition): WeaponStatBlock[] {
    const weaponStats: WeaponStatBlock[] = [];
    let idx = 0;
    for (const statHash in statsData.stats) {
      const stat: DestinyInventoryItemStatDefinition = statsData.stats[statHash];
      const statType = WeaponStat[statHash] as keyof typeof WeaponStat | undefined;
      if (!statType) {
        continue;
      }
      const statValue = stat.value;
      if (statValue == 0) {
        _logger.debug(statType, "had a value of 0");
        continue;
      }
      const weaponStatBlock = new WeaponStatBlock(idx, new WeaponStatData(statType, statValue));
      weaponStats.push(weaponStatBlock);
      idx += 1;
    }
    weaponStats.sort((a, b) =>
      StatOrder[a.stat.statType] > StatOrder[b.stat.statType]
        ? 1
        : StatOrder[a.stat.statType] < StatOrder[b.stat.statType]
        ? -1
        : 0
    );
    return weaponStats;
  }
}

export class WeaponStatBlock {
  readonly idx: number;
  readonly stat: WeaponStatData;

  constructor(idx: number, stat: WeaponStatData) {
    this.idx = idx;
    this.stat = stat;
  }

  toString() {
    return this.stat;
  }
}

export class WeaponStatData {
  readonly statType: keyof typeof WeaponStat;
  readonly value: number;

  constructor(statType: keyof typeof WeaponStat, value: number) {
    this.statType = statType;
    this.value = value;
  }

  toString() {
    return "**" + this.statType + "**: " + this.value;
  }
}
