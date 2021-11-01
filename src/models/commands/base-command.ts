export default interface BaseCommand<T> {
  readonly input: string;
  readonly results: Iterable<T> | IndexSignatureResultArray<T>;
}

interface IndexSignatureResultArray<T> {
  [key: string]: T[];
}
