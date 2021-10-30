import {
  DestinyItemSocketEntryPlugItemRandomizedDefinition,
  DestinyPlugSetDefinition,
} from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

export async function getPlugItemHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<number> {
  try {
    const result: DBTableRecordJSON = db
      .prepare("SELECT json FROM DestinyPlugSetDefinition WHERE hash = ?")
      .get(hash.toString());
    const jsonRes: DestinyPlugSetDefinition = JSON.parse(result.json);
    return jsonRes.reusablePlugItems[0].plugItemHash;
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get plugItemHash");
    throw e;
  }
}

export async function getPlugItemsByHash(
  db: BetterSqlite3.Database,
  hash: number
): Promise<DestinyItemSocketEntryPlugItemRandomizedDefinition[]> {
  try {
    const result: DBTableRecordJSON = db
      .prepare("SELECT json FROM DestinyPlugSetDefinition WHERE hash = ?")
      .get(hash.toString());
    const json_res: DestinyPlugSetDefinition = JSON.parse(result.json);
    return json_res.reusablePlugItems;
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get plugItems by hash");
    throw e;
  }
}
