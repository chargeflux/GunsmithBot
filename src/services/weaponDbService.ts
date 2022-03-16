import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import { WeaponDBTables, PerkWeaponHashMap } from "../models/db";
import { stringIs } from "../utils/validator";
import { MANIFEST_DATA_LOCATION } from "./manifest/manifestService";
import { logger } from "./loggerService";

const _logger = logger.getChildLogger({ name: "WeaponDB" });

export enum WeaponTableHash {
  "arrows" = 1257608559,
  "barrels" = 2833605196,
  "batteries" = 1757026848,
  "blades" = 1041766312,
  "bowstrings" = 3809303875,
  "grips" = 3962145884,
  "guards" = 683359327,
  "intrinsics" = 1744546145,
  "launchers" = 1202604782,
  "magazines" = 1806783418,
  "projectiles" = 2718120384,
  "scopes" = 2619833294,
  "stocks" = 577918720,
  "traits1" = 7906839,
  "traits2" = 7906839,
}

export const WeaponTables = [
  "arrows",
  "barrels",
  "batteries",
  "blades",
  "bowstrings",
  "grips",
  "guards",
  "intrinsics",
  "launchers",
  "magazines",
  "projectiles",
  "scopes",
  "stocks",
  "traits1",
  "traits2",
] as const;

export type WeaponTable = typeof WeaponTables[number];

const dbName = "weapon-db.sqlite3";

export default class WeaponDBService {
  db: BetterSqlite3.Database;

  constructor(db?: BetterSqlite3.Database) {
    if (db) {
      this.db = db;
    } else {
      this.db = this.getOrInitialize();
    }
  }

  private getOrInitialize(): BetterSqlite3.Database {
    if (!fs.existsSync(MANIFEST_DATA_LOCATION)) {
      fs.mkdirSync(MANIFEST_DATA_LOCATION);
      _logger.warn("DB and manifest data location does not exist. Creating folder");
    }
    const db = new BetterSqlite3(MANIFEST_DATA_LOCATION + dbName);
    return db;
  }

  reinitialize() {
    this.close();
    try {
      if (fs.existsSync(MANIFEST_DATA_LOCATION + dbName))
        fs.unlinkSync(MANIFEST_DATA_LOCATION + dbName);
      this.db = this.getOrInitialize();
    } catch (e) {
      _logger.error(e);
      throw new Error("Failed to delete manifest DB");
    }
  }

  construct(tables: WeaponDBTables) {
    this.reinitialize();
    _logger.info("Reinitialized DB");
    this.createTables();
    _logger.info("Created tables in DB");
    this.addRecords(tables);
    _logger.info("Added data to DB");
  }

  private createTables() {
    for (const table of WeaponTables) {
      // Using whitelisted table names
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS " +
          table +
          " (hash TEXT PRIMARY KEY NOT NULL, name TEXT, weaponHashIds TEXT)"
      );
    }
  }

  private addRecords(tables: WeaponDBTables) {
    const createTxn = this.db.transaction((records: PerkWeaponHashMap, stmt) => {
      for (const hash in records)
        stmt.run(hash, records[hash][0], Array.from(records[hash][1]).join(","));
    });
    for (const table in tables) {
      const stmt = this.db.prepare(
        // Using whitelisted table names
        "INSERT INTO " + table + " (hash, name, weaponHashIds) VALUES (?, ?, ?)"
      );
      if (stringIs<WeaponTable>(table, WeaponTables)) createTxn(tables[table] ?? {}, stmt);
    }
  }

  close(): void {
    this.db?.close();
  }
}
