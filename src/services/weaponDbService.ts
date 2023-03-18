import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import {
  PerkDBTables,
  PerkWeaponMapping,
  ArchetypeWeaponMapping,
} from "../models/database/weaponTable";
import { stringIs } from "../utils/validator";
import { MANIFEST_DATA_LOCATION } from "./manifestService";
import { logger } from "../logger";

const _logger = logger.getSubLogger({ name: "WeaponDB" });

export enum PerkTableHash {
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

export const PerkTables = [
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

export type PerkTable = typeof PerkTables[number];
export type PerkType = typeof PerkTables[number];

export type WeaponDB = BetterSqlite3.Database;

const dbName = "weapon-db.sqlite3";

export default class WeaponDBService {
  db: WeaponDB;

  constructor(db?: BetterSqlite3.Database, verbose?: boolean) {
    if (db) {
      this.db = db;
    } else {
      this.db = this.getOrInitialize(verbose ?? process.env.LOG_LEVEL == "trace");
    }
  }

  private getOrInitialize(verbose: boolean): WeaponDB {
    if (!fs.existsSync(MANIFEST_DATA_LOCATION)) {
      fs.mkdirSync(MANIFEST_DATA_LOCATION);
      _logger.warn("DB and manifest data location does not exist. Creating folder");
    }

    const db = new BetterSqlite3(MANIFEST_DATA_LOCATION + dbName, {
      verbose: verbose
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (message?: any, ...optionalParams: any[]) => _logger.trace(message, optionalParams)
        : undefined,
    });

    return db;
  }

  getVersion() {
    try {
      return this.db.prepare("SELECT version from Version ORDER BY timestamp desc").get().version;
    } catch (e) {
      _logger.warn(e, "Failed to get version");
      return "";
    }
  }

  setVersion(version: string) {
    this.db.exec("CREATE TABLE IF NOT EXISTS Version (version TEXT, timestamp INTEGER)");
    const stmt = this.db.prepare("INSERT INTO Version (version, timestamp) VALUES (?, ?)");
    stmt.run(version, Date.now());
  }

  reinitialize() {
    this.close();
    try {
      if (fs.existsSync(MANIFEST_DATA_LOCATION + dbName))
        fs.unlinkSync(MANIFEST_DATA_LOCATION + dbName);
      this.db = this.getOrInitialize(false);
    } catch (e) {
      _logger.error(e);
      throw new Error("Failed to delete manifest DB");
    }
  }

  construct(tables: PerkDBTables, archetypes: ArchetypeWeaponMapping) {
    this.reinitialize();
    _logger.info("Reinitialized DB");
    this.createTables();
    _logger.info("Created tables in DB");
    this.addRecords(tables, archetypes);
    _logger.info("Added data to DB");
  }

  private createTables() {
    for (const table of PerkTables) {
      // Using whitelisted table names
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS " +
          table.charAt(0).toUpperCase() +
          table.slice(1) +
          " (id INTEGER PRIMARY KEY, hash TEXT, name TEXT, weaponHash TEXT)"
      );
    }
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS " +
        "Archetypes" +
        " (id INTEGER PRIMARY KEY, weaponHash TEXT, name TEXT, slot TEXT, class TEXT, rarity TEXT, damage TEXT, powerCap TEXT, craftable BOOLEAN NOT NULL CHECK (craftable IN (0, 1)))"
    );
  }

  private addRecords(tables: PerkDBTables, archetypes: ArchetypeWeaponMapping) {
    const createTxn = this.db.transaction((records: PerkWeaponMapping, stmt) => {
      for (const hash in records)
        for (const item of Array.from(records[hash][1])) {
          stmt.run(hash, records[hash][0], item);
        }
    });
    for (const table in tables) {
      const stmt = this.db.prepare(
        // Using whitelisted table names
        "INSERT INTO " + table + " (hash, name, weaponHash) VALUES (?, ?, ?)"
      );
      if (stringIs<PerkTable>(table, PerkTables)) createTxn(tables[table] ?? {}, stmt);
    }

    const createArchetypesTxn = this.db.transaction((archetypes: ArchetypeWeaponMapping) => {
      const stmt = this.db.prepare(
        "INSERT INTO archetypes (weaponHash, name, slot, class, rarity, damage, powerCap, craftable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );
      for (const hash in archetypes) {
        const archetype = archetypes[hash];
        stmt.run(
          hash,
          archetype.name,
          archetype.slot,
          archetype.class,
          archetype.rarity,
          archetype.damage,
          archetype.powerCap == 0 ? null : archetype.powerCap,
          Number(archetype.craftable)
        );
      }
    });
    createArchetypesTxn(archetypes);
  }

  close(): void {
    this.db?.close();
  }
}
