import { DestinyItemSocketEntryPlugItemRandomizedDefinition } from "bungie-api-ts/destiny2";
import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export async function getPlugItemHash(hash: number): Promise<number> {
  try {
    var res = await getManifestTableData("DestinyPlugSetDefinition");
    var item = res.filter(sift({ hash: hash }));
    return item[0].reusablePlugItems[0].plugItemHash;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getPlugItems(
  hash: number
): Promise<DestinyItemSocketEntryPlugItemRandomizedDefinition[]> {
  try {
    var res = await getManifestTableData("DestinyPlugSetDefinition");
    var item = res.filter(sift({ hash: hash }));
    return item[0].reusablePlugItems;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
