export function stringIs<T extends string>(
  x: string,
  typeArray: readonly string[]
): x is T {
  return typeArray.includes(x as T);
}
