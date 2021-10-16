import BaseCommand from "./BaseCommand";

export default class ModCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "mod";
  readonly description: string = "Get information about a mod";
  readonly input: string;
}
