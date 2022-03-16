import { StatOrder } from "../constants";
import { Weapon } from "../destiny-entities/weapon";
import WeaponStats from "../destiny-entities/weaponStats";
import BaseCommand from "./baseCommand";

export default class CompareCommand implements BaseCommand<WeaponStats> {
  readonly input: string;
  readonly results: WeaponStats[] = [];
  readonly count: number = 2;
  statNames = "";
  weaponStatDiff?: WeaponStatDiff;

  constructor(input: string, weaponA: Weapon, weaponB: Weapon) {
    this.input = input;
    if (!weaponA.stats || !weaponB.stats)
      throw Error("One or both weapons are missing stat values: " + input);

    this.results.push(weaponA.stats);
    this.results.push(weaponB.stats);
    this.compareStats();
  }

  private compareStats() {
    const set1 = new Set(this.results[0].stats.map((x) => x.stat.statType));
    const set2 = new Set(this.results[1].stats.map((x) => x.stat.statType));
    const commonStats = new Set([...set1].filter((x) => set2.has(x)));
    let statsW1 = this.results[0].stats.filter((x) => [...commonStats].includes(x.stat.statType));
    let statsW2 = this.results[1].stats.filter((x) => [...commonStats].includes(x.stat.statType));
    statsW1 = [...statsW1].sort((a, b) =>
      StatOrder[a.stat.statType] > StatOrder[b.stat.statType]
        ? 1
        : StatOrder[a.stat.statType] < StatOrder[b.stat.statType]
        ? -1
        : 0
    );
    statsW2 = [...statsW2].sort((a, b) =>
      StatOrder[a.stat.statType] > StatOrder[b.stat.statType]
        ? 1
        : StatOrder[a.stat.statType] < StatOrder[b.stat.statType]
        ? -1
        : 0
    );

    const statBaseValues = [];
    const statDiffValues = [];
    const statNames = [];
    for (let i = 0; i < statsW1.length; i++) {
      statNames.push(statsW1[i].stat.statType);
      statBaseValues.push(statsW1[i].stat.value);
      statDiffValues.push(statsW1[i].stat.value - statsW2[i].stat.value);
    }
    this.statNames = statNames.join("\n");
    this.weaponStatDiff = new WeaponStatDiff(statBaseValues, statDiffValues);
  }

  generateStatDiffString(idx: number): string {
    const stats: string[] = [];
    if (!this.weaponStatDiff) throw Error("Stat Diffs were not computed");
    if (idx == 0) {
      for (const data of this.weaponStatDiff) {
        const [baseValue, diffValue]: number[] = data;
        if (diffValue > 0) stats.push("**" + baseValue.toString() + ` (+${diffValue})**`);
        else stats.push(baseValue.toString());
      }
      return stats.join("\n");
    }
    if (idx == 1) {
      for (const data of this.weaponStatDiff) {
        const [baseValue, diffValue]: number[] = data;
        if (diffValue < 0)
          stats.push("**" + (baseValue + diffValue * -1).toString() + ` (+${diffValue * -1})**`);
        else if (diffValue > 0) stats.push((baseValue - diffValue).toString());
        else stats.push(baseValue.toString());
      }
      return stats.join("\n");
    }
    throw Error("Stat Diffs could not be generated");
  }
}

class WeaponStatDiff {
  baseValues: number[];
  diffValues: number[];

  constructor(baseValues: number[], diffValues: number[]) {
    this.baseValues = baseValues;
    this.diffValues = diffValues;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.baseValues.length; i++) yield [this.baseValues[i], this.diffValues[i]];
  }
}
