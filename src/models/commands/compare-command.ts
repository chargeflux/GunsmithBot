import { StatOrder } from "../constants";
import { Weapon } from "../destiny-entities/weapon";
import BaseCommand from "./base-command";

export default class CompareCommand implements BaseCommand {
  readonly name: string = "compare";
  readonly description: string = "Compare stats between 2 weapons";
  readonly input: string;
  readonly weapons: Weapon[];
  statNames: string = "";
  weaponStatDiff?: WeaponStatDiff;

  constructor(input: string, weapons: Weapon[]) {
    this.input = input;
    this.weapons = weapons;
    this.process();
  }

  private process() {
    if (this.weapons.length != 2)
      throw Error("Number of weapons for comparison is not 2");
    if (!this.weapons[0].stats && !this.weapons[1].stats)
      throw Error("One or both Weapons are missing stat values");
    let set1 = new Set(this.weapons[0].stats.map((x) => x.stat.statType));
    let set2 = new Set(this.weapons[1].stats.map((x) => x.stat.statType));
    let commonStats = new Set([...set1].filter((x) => set2.has(x)));
    let statsW1 = this.weapons[0].stats.filter((x) =>
      [...commonStats].includes(x.stat.statType)
    );
    let statsW2 = this.weapons[1].stats.filter((x) =>
      [...commonStats].includes(x.stat.statType)
    );
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

    let statBaseValues = [];
    let statDiffValues = [];
    let statNames = [];
    for (let i = 0; i < statsW1.length; i++) {
      statNames.push(statsW1[i].stat.statType);
      statBaseValues.push(statsW1[i].stat.value);
      statDiffValues.push(statsW1[i].stat.value - statsW2[i].stat.value);
    }
    this.statNames = statNames.join("\n");
    this.weaponStatDiff = new WeaponStatDiff(statBaseValues, statDiffValues);
  }

  generateStatDiffString(idx: number): string {
    let stats: string[] = [];
    if (!this.weaponStatDiff) throw Error("Stat Diffs were not computed");
    if (idx == 0) {
      for (let data of this.weaponStatDiff) {
        let [baseValue, diffValue]: number[] = data;
        if (diffValue > 0)
          stats.push("**" + baseValue.toString() + ` (+${diffValue})**`);
        else stats.push(baseValue.toString());
      }
      return stats.join("\n");
    }
    if (idx == 1) {
      for (let data of this.weaponStatDiff) {
        let [baseValue, diffValue]: number[] = data;
        if (diffValue < 0)
          stats.push(
            "**" +
              (baseValue + diffValue * -1).toString() +
              ` (+${diffValue * -1})**`
          );
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
    for (let i = 0; i < this.baseValues.length; i++)
      yield [this.baseValues[i], this.diffValues[i]];
  }
}
