import BetterSqlite3 from "better-sqlite3";
import { PerkRecord } from "../../models/db";
import { WeaponTable } from "../weapon-db-service";
import { logger } from "../logger-service";

const _logger = logger.getChildLogger({ name: "SearchService" });

export async function getFuzzyQueryNames(
  db: BetterSqlite3.Database,
  type: WeaponTable,
  query: string
): Promise<string[]> {
  try {
    const results: PerkRecord[] = db
      .prepare("SELECT name FROM " + type + " WHERE name LIKE ?")
      .all("%" + query + "%");
    return results.map((x) => x.name);
  } catch (e) {
    _logger.error("Failed to get fuzzy matches of name", e);
    return [];
  }
}

export async function getWeaponsByExactName(
  db: BetterSqlite3.Database,
  type: WeaponTable,
  query: string
): Promise<number[]> {
  try {
    const results: PerkRecord = db
      .prepare("SELECT weaponHashIds FROM " + type + " WHERE name is ?")
      .get(query);
    const parsedResults = results.weaponHashIds.split(",").map((x) => parseInt(x));
    return parsedResults;
  } catch (e) {
    _logger.error(`Failed to get weapons in table ${type} by name: ${query}`, e);
    return [];
  }
}
