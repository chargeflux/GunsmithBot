import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import { ManifestTable, ManifestTableRecord } from "../models/database/manifestTable";
import { MANIFEST_DATA_LOCATION, TABLES } from "./manifestService";
import { logger } from "../logger";

const _logger = logger.getSubLogger({ name: "ManifestDB" });

const dbName = "manifest-db.sqlite3";

export type ManifestDB = BetterSqlite3.Database;

export default class ManifestDBService {
  db: ManifestDB;

  constructor(db?: BetterSqlite3.Database, verbose?: boolean) {
    if (db) {
      this.db = db;
    } else {
      this.db = this.getOrInitialize(verbose ?? process.env.LOG_LEVEL == "trace");
    }
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

  private getOrInitialize(verbose: boolean): ManifestDB {
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

  construct(tables: ManifestTable[]) {
    this.reinitialize();
    _logger.info("Reinitialized DB");
    this.createTables();
    _logger.info("Created tables in DB");
    this.addRecords(tables);
    _logger.info("Added data to DB");
  }

  private createTables() {
    for (const table of TABLES) {
      // Using whitelisted table names
      this.db.exec(
        "CREATE TABLE IF NOT EXISTS " +
          table +
          " (hash TEXT PRIMARY KEY NOT NULL, name TEXT, json TEXT)"
      );
    }
  }

  private addRecords(tables: ManifestTable[]) {
    const createTxn = this.db.transaction((records: ManifestTableRecord[], stmt) => {
      for (const record of records)
        stmt.run(record.hash.toString(), record.name, JSON.stringify(record.json));
    });
    for (const table of tables) {
      const stmt = this.db.prepare(
        // Using whitelisted table names
        "INSERT INTO " + table.name + " (hash, name, json) VALUES (?, ?, ?)"
      );
      createTxn(table.data, stmt);
    }
  }

  close(): void {
    this.db?.close();
  }
}
