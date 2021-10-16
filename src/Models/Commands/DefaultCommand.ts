import BaseCommand from "./BaseCommand";

export default class DefaultCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "default";
  readonly description: string = "Get default rolls for a weapon";
  readonly input: string;
}
