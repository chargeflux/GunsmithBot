import { DestinySocketTypeDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { ManifestTableRecordJSON } from "../../models/db";
import { logger } from "../loggerService";

const _logger = logger.getChildLogger({ name: "SocketService" });

export async function getSocketTypeHash(db: BetterSqlite3.Database, hash: number): Promise<number> {
  try {
    const result: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinySocketTypeDefinition WHERE hash = ?")
      .get(hash.toString());
    const jsonRes: DestinySocketTypeDefinition = JSON.parse(result.json);
    return jsonRes.plugWhitelist[0].categoryHash; // assume plugWhiteList has length of 1
  } catch (e) {
    _logger.error("Failed to get socketTypeHash", e);
    throw e;
  }
}
