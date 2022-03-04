import { orderResultsByName } from "../../utils/utils";
import Perk from "../destiny-entities/perk";
import BaseCommand from "./base-command";

export default class PerkCommand implements BaseCommand<Perk> {
  readonly input: string;
  readonly results: Perk[];
  readonly count: number;

  constructor(input: string, results: Perk[]) {
    this.input = input;
    this.count = results.length;
    this.results = orderResultsByName(input, results);
  }
}
