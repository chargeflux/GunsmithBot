import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export async function getInventoryItemByName(
  itemName: string
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    var res = await getManifestTableData("DestinyInventoryItemDefinition");
    var items = res.filter(sift({ "displayProperties.name": itemName }));
    return items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
