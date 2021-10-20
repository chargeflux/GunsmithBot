import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import { ManifestTable } from "../models/bungie-api/partial-destiny-manifest";
import { DBTableRecord } from "../models/db";
import { MANIFEST_DATA_LOCATION, TABLES } from "./manifest/manifest-service";

const dbName = "manifest-db.sqlite3";

export default class DBService {
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
    } catch (e) {
      console.log(e);
      throw new Error("Failed to delete manifest DB");
    }
  }

  construct(tables: ManifestTable[]) {
    try {
      this.reinitialize();
      console.log("Reinitialized DB");
      this.createTables();
      console.log("Created tables in DB");
      this.addRecords(tables);
      console.log("Added data to DB");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  private createTables() {
    for (let table of TABLES) {
      // Using whitelisted table names
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS " +
          table +
          " (hash TEXT PRIMARY KEY NOT NULL, name TEXT, json TEXT)"
      );
    }
  }

  private addRecords(tables: ManifestTable[]) {
    const createTxn = this.db.transaction((records: DBTableRecord[], stmt) => {
      for (const record of records)
        stmt.run(
          record.hash.toString(),
          record.name,
          JSON.stringify(record.json)
        );
    });
    for (let table of tables) {
      const stmt = this.db.prepare(
        // Using whitelisted table names
        "INSERT INTO " + table.name + " (hash, name, json) VALUES (?, ?, ?)"
      );
      createTxn(table.data, stmt);
    }
  }

  close(): void {
    console.log("Closing DB");
    this.db?.close();
  }
}
