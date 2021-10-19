import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export async function getInventoryItemByName(
  itemName: string
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    var res = await getManifestTableData("DestinyInventoryItemDefinition");
    var items = res.filter(
      sift({ "displayProperties.name": { $regex: itemName } })
    );
    return items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getInventoryItemByHash(
  hash: number
): Promise<DestinyInventoryItemDefinition> {
  try {
    var res = await getManifestTableData("DestinyInventoryItemDefinition");
    var items = res.filter(sift({ hash: hash }));
    return items[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getInventoryItemsByHash(
  hashes: number[]
): Promise<DestinyInventoryItemDefinition[]> {
  try {
    var res = await getManifestTableData("DestinyInventoryItemDefinition");
    var items = res.filter(sift({ hash: { $in: hashes } }));
    return items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
