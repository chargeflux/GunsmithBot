import { orderResultsByName } from "../../utils/utils";
import Mod from "../destiny-entities/mod";
import BaseCommand from "./baseCommand";

export default class ModCommand implements BaseCommand<Mod> {
  readonly input: string;
  readonly results: Mod[];
  readonly count: number;

  constructor(input: string, results: Mod[]) {
    this.input = input;
    this.count = results.length;
    this.results = orderResultsByName(this.input, results);
  }
}
