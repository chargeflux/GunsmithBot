import BaseCommand from "./base-command";

export default class FullCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "full";
  readonly description: string = "Get the full information about a weapon";
  readonly input: string;
}
