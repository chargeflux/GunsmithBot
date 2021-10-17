import BaseCommand from "./base-command";

export default class CompareCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "compare";
  readonly description: string = "Compare stats between 2 weapons";
  readonly input: string;
}
