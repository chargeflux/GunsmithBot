import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { ManifestTableRecord, ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { DestinyInventoryItemDefinitionRecord } from "../../models/database/weaponTable";
import { logger } from "../../logger";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getChildLogger({ name: "InventoryItemService" });

export async function getInventoryItemsByName(
  db: ManifestDB,
  query: string
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    const inventoryItems: ManifestTableRecordJSON[] = db
      .prepare("SELECT json FROM DestinyInventoryItemDefinition WHERE name LIKE ?")
      .all("%" + query + "%");
    return inventoryItems.map((x) => JSON.parse(x.json));
  } catch (e) {
    _logger.error("Failed to get inventory item by name");
    throw e;
  }
}

export async function getInventoryItemByHash(
  db: ManifestDB,
  hash: number
): Promise<DestinyInventoryItemDefinition> {
  try {
    const inventoryItem: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinyInventoryItemDefinition WHERE hash = ?")
      .get(hash.toString());
    return JSON.parse(inventoryItem.json);
  } catch (e) {
    _logger.error("Failed to get inventory item by hash");
    throw e;
  }
}

export async function getInventoryItemsByHashes(
  db: ManifestDB,
  hashes: number[]
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    const inventoryItems: ManifestTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinyInventoryItemDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return inventoryItems.map((x) => JSON.parse(x.json));
  } catch (e) {
    _logger.error("Failed to get inventory items by hashes");
    throw e;
  }
}

export async function getInventoryItemsWeapons(
  db: ManifestDB
): Promise<DestinyInventoryItemDefinitionRecord[]> {
  try {
    const inventoryItems: ManifestTableRecord[] = db
      .prepare(
        `SELECT item.hash, item.name, item.json
        FROM DestinyInventoryItemDefinition AS item, json_each(item.json, ?)
        WHERE json_each.value = 1 AND json_extract(item.json, ?) IS NOT null;`
      )
      .all("$.itemCategoryHashes", "$.sockets");
    const results: DestinyInventoryItemDefinitionRecord[] = [];
    for (const item of inventoryItems) {
      results.push({
        hash: item.hash,
        name: item.name,
        data: JSON.parse(item.json as string),
      });
    }
    return results;
  } catch (e) {
    _logger.error("Failed to get all weapons");
    throw e;
  }
}
