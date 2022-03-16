import BaseOptions from "./baseOptions";

export default class PerkOptions implements BaseOptions {
  readonly enhanced: boolean;

  constructor(enhanced: boolean) {
    this.enhanced = enhanced;
  }
}
