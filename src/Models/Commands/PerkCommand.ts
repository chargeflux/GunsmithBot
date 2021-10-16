import BaseCommand from "./BaseCommand";

export default class PerkCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "perk";
  readonly description: string = "Get information about a perk";
  readonly input: string;
}
