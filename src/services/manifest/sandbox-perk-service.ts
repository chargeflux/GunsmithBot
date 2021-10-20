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
  } catch (e) {
    console.error("Failed to get sandbox perk by name", e);
    throw e;
  }
}
