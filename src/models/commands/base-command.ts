export default interface BaseCommand<T> {
  input: string;
  results: Iterable<T>;
}
