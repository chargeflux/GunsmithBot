import { DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import BetterSqlite3 from "better-sqlite3";
import { DBTableRecordJSON } from "../../models/db";

export async function getSandboxPerksByName(
  db: BetterSqlite3.Database,
  query: string
): Promise<DestinySandboxPerkDefinition[]> {
  try {
    const items: DBTableRecordJSON[] = db
      .prepare(
        "SELECT json FROM DestinySandboxPerkDefinition WHERE name LIKE ?"
      )
      .all("%" + query + "%");
    return items.map((x) => JSON.parse(x.json));
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get sandbox perk by name");
    throw e;
  }
}

export async function getSandboxPerksByHashes(
  db: BetterSqlite3.Database,
  hashes: number[]
): Promise<DestinySandboxPerkDefinition[]> {
  try {
    const items: DBTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinySandboxPerkDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return items.map((x) => JSON.parse(x.json));
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get sandbox perk by hash");
    throw e;
  }
}
