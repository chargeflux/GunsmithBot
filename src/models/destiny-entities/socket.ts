import Perk from "./perk";
import { BaseDestinyItem } from "./baseMetadata";

export default class Socket implements BaseDestinyItem {
  idx: number;

  name: string;

  hash: number;

  perks: Perk[];

  constructor(idx: number, name: string, hash: number, perks: Perk[]) {
    this.idx = idx;
    this.name = name;
    this.hash = hash;
    this.perks = this.removeEnhancedDuplicatePerks(perks);
  }

  removeEnhancedDuplicatePerks(perks: Perk[]) {
    const processedPerks: Perk[] = [];
    const processed: Map<string, number> = new Map();
    for (const perk of perks) {
      if (perk.isEnhanced) {
        const index = processed.get(perk.name);
        if (index === undefined) {
          processedPerks.push(perk);
        } else {
          const originalPerk = processedPerks[index];
          if (perk.currentlyCanRoll && originalPerk.currentlyCanRoll) {
            processedPerks[index] = perk;
          }
        }
      } else {
        const newIndex = processed.size;
        processed.set(perk.name, newIndex);
        processedPerks[newIndex] = perk;
      }
    }
    return processedPerks;
  }

  toString(canRoll = true) {
    const filteredPerks = this.perks.filter((x) => {
      if (x.currentlyCanRoll == canRoll) return x;
    });

    const uniquePerks = new Map<number, Perk>(filteredPerks.map((x) => [x.hash, x]));

    return Array.from(uniquePerks.values())
      .map((x) => x.toString())
      .join("\n");
  }
}
