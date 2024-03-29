import axios from "axios";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import sharp, { OverlayOptions } from "sharp";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import fuzzysort from "fuzzysort";
import { WeaponClass, WEAPON_CATEGORY_HASH } from "../models/constants";
import { BaseMetadata } from "../models/destiny-entities/baseMetadata";
import { MANIFEST_DATA_LOCATION } from "../services/manifestService";

const CACHE_LOCATION = path.join(MANIFEST_DATA_LOCATION, "cache/");

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Fuzzy sort results with stability by using hash as identifier
 */
export function orderResultsByName<k extends BaseMetadata>(query: string, metadata: k[]) {
  const fzResults = fuzzysort.go(query, metadata, {
    allowTypo: false,
    key: "name",
  });

  const groups = groupByDuplicates(fzResults.map((x) => x.score));

  let all_results: k[] = [];

  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    const results = [];
    for (let index = 0; index < group.length; index++) {
      const element = group[index];
      const item = fzResults[element];
      results.push(item.obj);
    }
    results.sort((a, b) => {
      return metadata.indexOf(a) - metadata.indexOf(b);
    });
    all_results = all_results.concat(results);
  }

  return all_results;
}

export function groupByDuplicates<k>(items: k[]): number[][] {
  const fn = (items: k[], start: number) => {
    let first = null;
    const indices = [];
    for (let index = start; index < items.length; index++) {
      const element = items[index];
      if (first === null) {
        first = element;
        indices.push(index);
        continue;
      }
      if (first === element) {
        indices.push(index);
      } else {
        break;
      }
    }
    return indices;
  };

  const groups = [];
  let current_idx = 0;
  while (current_idx != items.length) {
    const indices = fn(items, current_idx);
    groups.push(indices);
    current_idx += indices.length;
  }
  return groups;
}

export function validateWeaponSearch(rawWeaponData: DestinyInventoryItemDefinition): boolean {
  const categoryHashes = rawWeaponData.itemCategoryHashes ?? [];
  if (!categoryHashes.includes(WEAPON_CATEGORY_HASH)) return false;
  if (categoryHashes.includes(WeaponClass.Dummy)) return false;
  if (!rawWeaponData.sockets) return false;
  return true;
}

export async function initializeCache() {
  if (!fs.existsSync(CACHE_LOCATION)) {
    await fsPromises.mkdir(CACHE_LOCATION);
  }
}

export async function getImageBuffer(url: string, cache = true): Promise<Buffer> {
  const filePath = CACHE_LOCATION + url.split("/").pop();
  if (cache) {
    if (fs.existsSync(filePath)) {
      const data = await fsPromises.readFile(filePath);
      return data;
    }
  }
  let response;
  try {
    response = await axios.get(url, {
      responseType: "arraybuffer",
    });
  } catch {
    throw Error("failed to get image");
  }
  if (response?.status != 200) {
    throw Error("failed to get image");
  }
  const buffer = Buffer.from(response.data as ArrayBuffer);
  if (cache) {
    await fs.promises.writeFile(filePath, buffer);
  }

  return buffer;
}

export async function overlayImages(images: Buffer[]): Promise<Buffer> {
  const baseImage = sharp(images[0]);
  const overlays: OverlayOptions[] = [];
  for (let index = 1; index < images.length; index++) {
    const element = images[index];
    overlays.push({ input: element });
  }
  return baseImage.composite(overlays).toBuffer();
}
