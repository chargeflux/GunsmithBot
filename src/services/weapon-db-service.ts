import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import { WeaponDBTable, WeaponDBTableRecord } from "../models/db";
import { MANIFEST_DATA_LOCATION } from "./manifest/manifest-service";

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
];

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
      console.warn(
        "DB and manifest data location does not exist. Creating folder"
      );
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
    } catch (e: any) {
      console.log(e);
      throw new Error("Failed to delete manifest DB");
    }
  }

  construct(tables: WeaponDBTable) {
    try {
      this.reinitialize();
      console.log("Reinitialized DB");
      this.createTables();
      console.log("Created tables in DB");
      this.addRecords(tables);
      console.log("Added data to DB");
    } catch (err: any) {
      console.error(err.stack);
      throw err;
    }
  }

  private createTables() {
    for (let table of WeaponTables) {
      // Using whitelisted table names
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS " +
          table +
          " (hash TEXT PRIMARY KEY NOT NULL, name TEXT, weaponHashIds TEXT)"
      );
    }
  }

  private addRecords(tables: WeaponDBTable) {
    const createTxn = this.db.transaction(
      (records: WeaponDBTableRecord, stmt) => {
        for (const hash in records)
          stmt.run(
            hash,
            records[hash][0],
            Array.from(records[hash][1]).join(",")
          );
      }
    );
    for (let table in tables) {
      const stmt = this.db.prepare(
        // Using whitelisted table names
        "INSERT INTO " + table + " (hash, name, weaponHashIds) VALUES (?, ?, ?)"
      );
      createTxn(tables[table as keyof typeof WeaponTableHash] ?? {}, stmt);
    }
  }

  close(): void {
    //console.log("Closing DB");
    this.db?.close();
  }
}
