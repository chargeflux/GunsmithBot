import BetterSqlite3 from "better-sqlite3";
import { PerkRecord } from "../../models/database/weaponTable";
import { WeaponTable } from "../weaponDbService";
import { logger } from "../../logger";

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
    const results: PerkRecord[] = db
      .prepare("SELECT weaponHash FROM " + type + " WHERE name is ?")
      .all(query);
    const parsedResults = results.map((x) => parseInt(x.weaponHash));
    return parsedResults;
  } catch (e) {
    _logger.error(`Failed to get weapons in table ${type} by name: ${query}`, e);
    return [];
  }
}

export async function executeSearchQuery(
  db: BetterSqlite3.Database,
  stmt: string,
  queries: string[]
): Promise<number[]> {
  try {
    const results: PerkRecord[] = db.prepare(stmt).all(queries);
    const parsedResults = results.map((x) => parseInt(x.weaponHash));
    return parsedResults;
  } catch (e) {
    _logger.error(`Failed to execute statement '${stmt}'`, e);
    throw e;
  }
}
