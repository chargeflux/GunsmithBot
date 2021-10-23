import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

export default async function getPowerCap(
  db: BetterSqlite3.Database,
  hashes: number[]
): Promise<number[]> {
  try {
    const result: DBTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinyPowerCapDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return result
      .map((x) => JSON.parse(x.json).powerCap)
      .sort()
      .reverse(); // newest first
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get power cap levels");
    return [];
  }
}
