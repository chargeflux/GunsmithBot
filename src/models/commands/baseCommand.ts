export default interface BaseCommand<BaseDestinyItem> {
  readonly input: string;
  readonly results: Iterable<BaseDestinyItem> | IndexSignatureResultArray<BaseDestinyItem>;
  readonly count: number;
}

interface IndexSignatureResultArray<T> {
  [key: string]: T[];
}
