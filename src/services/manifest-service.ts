import axios from "axios";
import {
  PartialDestinyManifest,
  ManifestTable,
} from "../models/bungie-api/partial-destiny-manifest";

const BUNGIE_API_MANIFEST_URL =
  "https://www.bungie.net/Platform/Destiny2/Manifest/";

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
  // FIXME: insert get version function
  if (manifest.version != "GET_VERSION_FUNCTION") {
    const result = await getManifestTables(manifest);
    // TODO: process result
    console.log("Obtained manifest tables");
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
  for (var table of TABLES) {
    const url = manifest.response.jsonWorldComponentContentPaths.en[table];
    try {
      var response = await axios.get<string>("https://bungie.net" + url);
      console.log("Received manifest for: " + table);
      const manifestTable = new ManifestTable(table, response.data);
      manifestTables.push(manifestTable);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  return manifestTables;
}
