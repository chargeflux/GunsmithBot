import { DestinySocketTypeDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

export async function getSocketTypeHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<number> {
  try {
    const result: DBTableRecordJSON = db
      .prepare("SELECT json FROM DestinySocketTypeDefinition WHERE hash = ?")
      .get(hash.toString());
    const jsonRes: DestinySocketTypeDefinition = JSON.parse(result.json);
    return jsonRes.plugWhitelist[0].categoryHash; // assume plugWhiteList has length of 1
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get socketTypeHash");
    throw e;
  }
}
