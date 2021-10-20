import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

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
  } catch (e) {
    console.error("Failed to get inventory item by name", e);
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
  } catch (e) {
    console.error("Failed to get inventory item by hash", e);
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
  } catch (e) {
    console.error("Failed to get inventory items by hashes", e);
    throw e;
  }
}
