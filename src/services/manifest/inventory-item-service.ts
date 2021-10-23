import BetterSqlite3 from "better-sqlite3";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import {
  DBTableRecordJSON,
  DBTableRecordResult,
  DBTableRecordResultAllWeaponsParsed,
} from "../../models/db";

export async function getInventoryItemsByName(
  db: BetterSqlite3.Database,
  query: string
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    const inventoryItems: DBTableRecordJSON[] = db
      .prepare(
        "SELECT json FROM DestinyInventoryItemDefinition WHERE name LIKE ?"
      )
      .all("%" + query + "%");
    return inventoryItems.map((x) => JSON.parse(x.json));
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get inventory item by name");
    throw e;
  }
}

export async function getInventoryItemByHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<DestinyInventoryItemDefinition> {
  try {
    const inventoryItem: DBTableRecordJSON = db
      .prepare("SELECT json FROM DestinyInventoryItemDefinition WHERE hash = ?")
      .get(hash.toString());
    return JSON.parse(inventoryItem.json);
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get inventory item by hash");
    throw e;
  }
}

export async function getInventoryItemsByHashes(
  db: BetterSqlite3.Database,
  hashes: number[]
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    const inventoryItems: DBTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinyInventoryItemDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return inventoryItems.map((x) => JSON.parse(x.json));
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get inventory items by hashes");
    throw e;
  }
}

export async function getInventoryItemsWeapons(
  db: BetterSqlite3.Database
): Promise<DBTableRecordResultAllWeaponsParsed[]> {
  try {
    const inventoryItems: DBTableRecordResult[] = db
      .prepare(
        `SELECT item.hash, item.name, item.json
        FROM DestinyInventoryItemDefinition AS item, json_each(item.json, ?)
        WHERE json_each.value = 1 AND json_extract(item.json, ?) IS NOT null;`
      )
      .all("$.itemCategoryHashes", "$.sockets");
    let results: DBTableRecordResultAllWeaponsParsed[] = [];
    for (let item of inventoryItems) {
      results.push({
        hash: item.hash,
        name: item.name,
        data: JSON.parse(item.json),
      });
    }
    return results;
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get all weapons");
    throw e;
  }
}
