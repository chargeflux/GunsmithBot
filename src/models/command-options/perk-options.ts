import BaseOptions from "./base-options";

export default class PerkOptions implements BaseOptions {
  readonly enhanced: boolean;

  constructor(enhanced: boolean) {
    this.enhanced = enhanced;
  }
}
