export default interface BaseCommand {
  readonly name: string;
  readonly description: string;
  input: string;
}
