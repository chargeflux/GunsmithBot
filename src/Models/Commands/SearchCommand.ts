import BaseCommand from "./BaseCommand";

export default class SearchCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "search";
  readonly description: string = "Search for weapons with specific perks";
  readonly input: string;
}
