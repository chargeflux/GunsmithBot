import sift from "sift";
import { ManifestTableData } from "../models/bungie-api/partial-destiny-manifest";
import { getManifestTableData } from "./manifest-service";

export async function getInventoryItemByName(
  itemName: string
): Promise<ManifestTableData[]> {
  try {
    var res = await getManifestTableData("DestinyInventoryItemDefinition");
    var items = res.filter(sift({ "displayProperties.name": itemName }));
    return items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
