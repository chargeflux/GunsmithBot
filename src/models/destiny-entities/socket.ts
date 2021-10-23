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

  toString() {
    return this.perks.map((x) => x.toString()).join("\n");
  }
}
