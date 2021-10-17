import axios from "axios";
import {
  PartialDestinyManifest,
  ManifestTable,
  ManifestTableData,
} from "../models/bungie-api/partial-destiny-manifest";
import fs from "fs";

const BUNGIE_API_MANIFEST_URL =
  "https://www.bungie.net/Platform/Destiny2/Manifest/";

const MANIFEST_DATA_LOCATION = "data/";

const TABLES = [
  "DestinyInventoryItemDefinition",
  "DestinyPlugSetDefinition",
  "DestinySocketTypeDefinition",
  "DestinyPowerCapDefinition",
  "DestinySandboxPerkDefinition",
  "DestinyCollectibleDefinition",
];

export default async function updateManifest() {
  var manifest = await getManifest();
  if (manifest.Response.version != (await getCurrentVersion())) {
    console.log("Updating manifest");
    const result = await getManifestTables(manifest);
    saveManifestData(result, manifest.Response.version);
    // TODO: process result
    console.log("Saved new manifest tables");
  }
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
        var response = await axios.get<ManifestTableData>(
          "https://bungie.net" + url,
          {
            headers: { "X-API-Key": process.env.BUNGIE_KEY },
          }
        );
        console.log("Received manifest for: " + table);
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

async function saveManifestData(
  manifestTables: ManifestTable[],
  version: string
) {
  try {
    if (!fs.existsSync(MANIFEST_DATA_LOCATION)) {
      fs.mkdirSync(MANIFEST_DATA_LOCATION);
    }
    for (var table of manifestTables) {
      fs.writeFileSync(
        MANIFEST_DATA_LOCATION + table.name + ".json",
        JSON.stringify(table.data, null, 2)
      );
      console.log("Saved table: ", table.name);
    }
    fs.writeFileSync(MANIFEST_DATA_LOCATION + "version", version);
    console.log("Saved version: ", version);
  } catch (err) {
    console.log(err);
    throw Error("Failed to write manifest");
  }
}

async function getCurrentVersion(): Promise<string> {
  try {
    var version = fs.readFileSync(MANIFEST_DATA_LOCATION + "version", "utf-8");
    return version;
  } catch (err) {
    console.log(err);
    return "";
  }
}

export function getManifestTableData(tableName: string): ManifestTableData[] {
  var tableData: ManifestTableData[] = JSON.parse(
    fs.readFileSync(MANIFEST_DATA_LOCATION + tableName + ".json", "utf-8")
  );
  return tableData;
}
