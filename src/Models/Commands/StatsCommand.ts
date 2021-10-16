import BaseCommand from "./BaseCommand";

export default class StatsCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "stats";
  readonly description: string = "Get the stats information about weapons";
  readonly input: string;
}
