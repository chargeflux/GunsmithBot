import fs from "fs";
import SearchController from "../controllers/searchController";
import { ManifestTable } from "../models/bungie-api/partialDestinyManifest";
import ManifestDBService from "../services/manifestDbService";
import { getInventoryItemsWeapons } from "../services/manifest/inventoryItemService";
import { TABLES } from "../services/manifest/manifestService";
import WeaponDBService from "../services/weaponDbService";
import path from "path";

test.skip("build database from json", async () => {
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
  dbService.construct(manifestTables);
  const weaponItems = await getInventoryItemsWeapons(dbService.db);
  const tables = await new SearchController().createWeaponTables(weaponItems);
  new WeaponDBService().construct(tables);
});

test("validate columns", () => {
  const dbService = new ManifestDBService();
  const result = dbService.db
    .prepare("SELECT name FROM DestinyInventoryItemDefinition LIMIT 1")
    .get();
  expect(result.name).not.toBeNull();
  expect(result.hash).not.toBeNull();
  expect(result.data).not.toBeNull();
});
