import axios from "axios";
import {
  DestinyDefinitionFrom,
  DestinyManifestComponentName,
} from "bungie-api-ts/destiny2";
import fs from "fs";
import {
  ManifestTable,
  PartialDestinyManifest,
} from "../../models/bungie-api/partial-destiny-manifest";
import ManifestDBService from "../manifest-db-service";

const BUNGIE_API_MANIFEST_URL =
  "https://www.bungie.net/Platform/Destiny2/Manifest/";

export const MANIFEST_DATA_LOCATION = "data/";

export const TABLES = [
  "DestinyInventoryItemDefinition",
  "DestinyPlugSetDefinition",
  "DestinySocketTypeDefinition",
  "DestinyPowerCapDefinition",
  "DestinySandboxPerkDefinition",
  "DestinyCollectibleDefinition",
] as const;

export async function updateManifest(db: ManifestDBService): Promise<boolean> {
  var manifest = await getManifest();
  console.log("Checking if manifest is up to date");
  if (manifest.Response.version != (await getCurrentVersion())) {
    console.log("Version is outdated. Updating manifest");
    const tables = await getManifestTables(manifest);
    processAndSaveManifestDataJSON(manifest, tables);
    console.log("Saved new processed manifest tables to JSON");
    db.construct(tables);
    console.log("Saved new processed manifest tables to DB");
    return true;
  }
  console.log("Manifest is up to date");
  return false;
}

async function getManifest(): Promise<PartialDestinyManifest> {
  let result: PartialDestinyManifest;
  if (process.env.BUNGIE_KEY) {
    try {
      var response = await axios.get<PartialDestinyManifest>(
        BUNGIE_API_MANIFEST_URL,
        {
          headers: { "X-API-Key": process.env.BUNGIE_KEY },
        }
      );
      console.log("Received manifest");
      result = response.data;
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    throw new Error("Configuration is invalid. Check BUNGIE_KEY");
  }
}

async function getManifestTables(
  manifest: PartialDestinyManifest
): Promise<ManifestTable[]> {
  var manifestTables: ManifestTable[] = [];
  if (process.env.BUNGIE_KEY) {
    for (var table of TABLES) {
      const url = manifest.Response.jsonWorldComponentContentPaths.en[table];
      try {
        var response = await axios.get<
          DestinyDefinitionFrom<DestinyManifestComponentName>[]
        >("https://bungie.net" + url, {
          headers: { "X-API-Key": process.env.BUNGIE_KEY },
        });
        console.log("Received manifest for:", table);
        const manifestTable = new ManifestTable(table, response.data);
        manifestTables.push(manifestTable);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  } else {
    throw new Error("Configuration is invalid. Check BUNGIE_KEY");
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
    console.log("Saved latest manifest");
    for (var table of manifestTables) {
      fs.writeFileSync(
        MANIFEST_DATA_LOCATION + table.name + "Table.json",
        JSON.stringify(table.data, null, 2)
      );
      console.log("Saved table:", table.name);
    }
    fs.writeFileSync(
      MANIFEST_DATA_LOCATION + "version",
      latestManifest.Response.version
    );
    console.log("Saved version:", latestManifest.Response.version);
  } catch (err: any) {
    console.log(err);
    throw Error("Failed to write manifest");
  }
}

export async function getCurrentVersion(): Promise<string> {
  try {
    var version = fs.readFileSync(MANIFEST_DATA_LOCATION + "version", "utf-8");
    return version;
  } catch (err: any) {
    console.log(err);
    return "";
  }
}
