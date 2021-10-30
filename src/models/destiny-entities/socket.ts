import Perk from "./perk";

export default class Socket {
  idx: number;

  name: string;

  hash: number;

  perks: Perk[];

  constructor(idx: number, name: string, hash: number, perks: Perk[]) {
    this.idx = idx;
    this.name = name;
    this.hash = hash;
    this.perks = perks;
  }

  toString(canRoll = true) {
    let filteredPerks = this.perks.filter((x) => {
      if (x.currentlyCanRoll == canRoll) return x;
    });

    let uniquePerks = new Map<number, Perk>(
      filteredPerks.map((x) => [x.hash, x])
    );

    return Array.from(uniquePerks.values())
      .map((x) => x.toString())
      .join("\n");
  }
}
