import fuzzysort from "fuzzysort";
import { BaseMetadata } from "../models/commands/base-metadata";

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function orderResults<k extends BaseMetadata>(
  query: string,
  metadata: k[]
) {
  const results = fuzzysort.go(query, metadata, {
    allowTypo: false,
    key: "name",
  });

  return results.map((x) => x.obj);
}
