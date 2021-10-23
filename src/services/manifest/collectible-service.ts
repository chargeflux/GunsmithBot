import { DestinyCollectibleDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

export async function getCollectibleByHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<DestinyCollectibleDefinition> {
  try {
    const item: DBTableRecordJSON = db
      .prepare("SELECT json FROM DestinyCollectibleDefinition WHERE hash=?")
      .get(hash.toString());
    return JSON.parse(item.json);
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get collectible by hash");
    throw e;
  }
}
