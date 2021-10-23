import BetterSqlite3 from "better-sqlite3";
import {
  WeaponDBTableRecordNameResult,
  WeaponDBTableRecordResult,
} from "../../models/db";
import { WeaponTableHash } from "../weapon-db-service";

export async function getFuzzyQueryNames(
  db: BetterSqlite3.Database,
  type: keyof typeof WeaponTableHash,
  query: string
): Promise<string[]> {
  try {
    const results: WeaponDBTableRecordNameResult[] = db
      .prepare("SELECT name FROM " + type + " WHERE name LIKE ?")
      .all("%" + query + "%");
    return results.map((x) => x.name);
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to get fuzzy matches of name");
    return [];
  }
}

export async function getWeaponsByExactName(
  db: BetterSqlite3.Database,
  type: keyof typeof WeaponTableHash,
  query: string
): Promise<number[]> {
  try {
    const results: WeaponDBTableRecordResult = db
      .prepare("SELECT weaponHashIds FROM " + type + " WHERE name is ?")
      .get(query);
    let parsedResults = results.weaponHashIds
      .split(",")
      .map((x) => parseInt(x));
    return parsedResults;
  } catch (e: any) {
    console.error(`Failed to get weapons in table ${type} by name: ${query}`);
    return [];
  }
}
