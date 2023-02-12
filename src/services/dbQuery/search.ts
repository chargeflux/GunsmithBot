import { PerkRecord } from "../../models/database/weaponTable";
import { WeaponDB, PerkTable } from "../weaponDbService";
import { logger } from "../../logger";
import { WeaponArchetype } from "../../models/destiny-entities/weaponArchetype";

const _logger = logger.getChildLogger({ name: "SearchService" });

export async function getFuzzyQueryNames(
  db: WeaponDB,
  type: PerkTable,
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

export async function executeSearchQuery(
  db: WeaponDB,
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

export async function getWeaponArchetypes(db: WeaponDB, hashes: number[]) {
  try {
    const archetypes: WeaponArchetype[] = db
      .prepare(
        `SELECT name, slot, class, rarity, damage, powerCap FROM archetypes WHERE weaponHash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)}) ORDER BY powerCap`
      )
      .all(hashes.map((x) => x.toString()));
    return archetypes;
  } catch (e) {
    _logger.error("Failed to get weapon archetypes by hashes", e);
    throw e;
  }
}
