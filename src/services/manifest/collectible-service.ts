import { DestinyCollectibleDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { ManifestTableRecordJSON } from "../../models/db";
import { logger } from "../logger-service";

const _logger = logger.getChildLogger({ name: "CollectibleService" });

export async function getCollectibleByHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<DestinyCollectibleDefinition> {
  try {
    const item: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinyCollectibleDefinition WHERE hash=?")
      .get(hash.toString());
    return JSON.parse(item.json);
  } catch (e) {
    _logger.error("Failed to get collectible by hash");
    throw e;
  }
}
