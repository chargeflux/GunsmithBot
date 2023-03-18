import axios from "axios";
import { DestinyDefinitionFrom, DestinyManifestComponentName } from "bungie-api-ts/destiny2";
import fs from "fs";
import { PartialDestinyManifest } from "../models/bungie-api/partialDestinyManifest";
import { ManifestTable } from "../models/database/manifestTable";
import ManifestDBService from "./manifestDbService";
import { logger } from "../logger";
import ConfigurationError from "../models/errors/configurationError";

const _logger = logger.getSubLogger({ name: "ManifestService" });

const BUNGIE_API_MANIFEST_URL = "https://www.bungie.net/Platform/Destiny2/Manifest/";

export const MANIFEST_DATA_LOCATION = "data/";

export const TABLES = [
  "DestinyInventoryItemDefinition",
  "DestinyPlugSetDefinition",
  "DestinySocketTypeDefinition",
  "DestinyPowerCapDefinition",
  "DestinySandboxPerkDefinition",
  "DestinyCollectibleDefinition",
] as const;

export async function updateManifest(db: ManifestDBService): Promise<string> {
  const manifest = await getManifest();
  _logger.info("Checking if manifest is up to date");
  if (
    manifest.Response.version != (await getCurrentVersion()) ||
    manifest.Response.version != db.getVersion()
  ) {
    _logger.info("Version is outdated. Updating manifest");
    const tables = await getManifestTables(manifest);
    processAndSaveManifestDataJSON(manifest, tables);
    _logger.info("Saved new processed manifest tables to JSON");
    db.construct(tables);
    _logger.info("Saved new processed manifest tables to DB");
    db.setVersion(manifest.Response.version);
    return manifest.Response.version;
  }
  _logger.info("Manifest is up to date");
  return manifest.Response.version;
}

async function getManifest(): Promise<PartialDestinyManifest> {
  let result: PartialDestinyManifest;
  if (process.env.BUNGIE_KEY) {
    const response = await axios.get<PartialDestinyManifest>(BUNGIE_API_MANIFEST_URL, {
      headers: { "X-API-Key": process.env.BUNGIE_KEY },
    });
    _logger.info("Received manifest");
    result = response.data;
    return result;
  } else {
    throw new ConfigurationError("Check BUNGIE_KEY");
  }
}

async function getManifestTables(manifest: PartialDestinyManifest): Promise<ManifestTable[]> {
  const manifestTables: ManifestTable[] = [];
  if (process.env.BUNGIE_KEY) {
    for (const table of TABLES) {
      const url = manifest.Response.jsonWorldComponentContentPaths.en[table];
      const response = await axios.get<DestinyDefinitionFrom<DestinyManifestComponentName>[]>(
        "https://bungie.net" + url,
        {
          headers: { "X-API-Key": process.env.BUNGIE_KEY },
        }
      );
      _logger.info("Received manifest for:", table);
      if (!fs.existsSync(MANIFEST_DATA_LOCATION)) {
        fs.mkdirSync(MANIFEST_DATA_LOCATION);
      }
      if (process.env.DUMP_RAW_DATA == "true") {
        if (!fs.existsSync(MANIFEST_DATA_LOCATION + "raw")) {
          fs.mkdirSync(MANIFEST_DATA_LOCATION + "raw");
        }
        fs.writeFileSync(
          MANIFEST_DATA_LOCATION + "raw/" + table + ".json",
          JSON.stringify(response.data, null, 2)
        );
      }
      const manifestTable = new ManifestTable(table, response.data);
      manifestTables.push(manifestTable);
    }
  } else {
    throw new ConfigurationError("Check BUNGIE_KEY");
  }
  return manifestTables;
}

async function processAndSaveManifestDataJSON(
  latestManifest: PartialDestinyManifest,
  manifestTables: ManifestTable[]
) {
  try {
    if (!fs.existsSync(MANIFEST_DATA_LOCATION)) {
      fs.mkdirSync(MANIFEST_DATA_LOCATION);
    }
    fs.writeFileSync(
      MANIFEST_DATA_LOCATION + "LatestManifest.json",
      JSON.stringify(latestManifest, null, 2)
    );
    _logger.info("Saved latest manifest");
    for (const table of manifestTables) {
      if (process.env.DUMP_RAW_DATA == "true") {
        fs.writeFileSync(
          MANIFEST_DATA_LOCATION + "raw/" + table.name + "Table.json",
          JSON.stringify(table.data, null, 2)
        );
        _logger.info("Saved table:", table.name);
      }
    }
    fs.writeFileSync(MANIFEST_DATA_LOCATION + "version", latestManifest.Response.version);
    _logger.info("Saved version:", latestManifest.Response.version);
  } catch (err) {
    _logger.info(err);
    throw Error("Failed to write manifest");
  }
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const version = fs.readFileSync(MANIFEST_DATA_LOCATION + "version", "utf-8");
    return version;
  } catch {
    _logger.error("Failed to open version in " + MANIFEST_DATA_LOCATION);
    return "";
  }
}
