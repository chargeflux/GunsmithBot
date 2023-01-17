import fs from "fs";
import SearchController from "../controllers/searchController";
import { ManifestTable } from "../models/database/manifestTable";
import ManifestDBService from "../services/manifestDbService";
import {
  getInventoryItemsByName,
  getInventoryItemsWeapons,
} from "../services/dbQuery/inventoryItem";
import { TABLES } from "../services/manifestService";
import WeaponDBService from "../services/weaponDbService";
import path from "path";

const shouldRun = fs.existsSync("data/raw/") ? test : test.skip;
jest.setTimeout(60000);

shouldRun("build database from json", async () => {
  const MANIFEST_DATA_LOCATION = "data/raw/";
  const dbService = new ManifestDBService();
  const manifestTables: ManifestTable[] = [];
  for (const table of TABLES) {
    const filePath = path.join(process.cwd(), MANIFEST_DATA_LOCATION, `${table}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    expect(data).not.toBe(undefined);
    const manifestTable = new ManifestTable(table, JSON.parse(data));
    manifestTables.push(manifestTable);
  }
  await dbService.construct(manifestTables);
  const weaponItems = await getInventoryItemsWeapons(dbService.db);
  const tables = await new SearchController().createWeaponTables(weaponItems);
  const weaponDbService = new WeaponDBService();
  weaponDbService.construct(tables);
  weaponDbService.close();

  const items = await getInventoryItemsByName(dbService.db, "Transmat");
  expect(items.length).toBeGreaterThan(0);
  expect(items[0].hash).not.toBeNull();
  expect(items[0].displayProperties.name).toEqual("Transmat Effects");
  dbService.close();
});

shouldRun("lazy build database from json", async () => {
  const MANIFEST_DATA_LOCATION = "data/raw/";
  const dbService = new ManifestDBService();
  const manifestTables: ManifestTable[] = [];
  for (const table of TABLES) {
    const filePath = path.join(process.cwd(), MANIFEST_DATA_LOCATION, `${table}.json`);
    const manifestTable = new ManifestTable(table, filePath, true);
    manifestTables.push(manifestTable);
  }

  await dbService.construct(manifestTables);
  const weaponItems = await getInventoryItemsWeapons(dbService.db);
  const tables = await new SearchController().createWeaponTables(weaponItems);
  const weaponDbService = new WeaponDBService();
  weaponDbService.construct(tables);

  const items = await getInventoryItemsByName(dbService.db, "Transmat Effects");
  expect(items.length).toBeGreaterThan(0);
  expect(items[0].hash).not.toBeNull();
  expect(items[0].displayProperties.name).toEqual("Transmat Effects");
  weaponDbService.close();
  dbService.close();
});
