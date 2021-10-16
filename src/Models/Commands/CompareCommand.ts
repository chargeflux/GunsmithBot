import BaseCommand from "./BaseCommand";

export default class CompareCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "compare";
  readonly description: string = "Compare stats between 2 weapons";
  readonly input: string;
}
