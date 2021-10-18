import { DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export async function getSandboxPerkByName(
  itemName: string
): Promise<DestinySandboxPerkDefinition[]> {
  try {
    var res = await getManifestTableData("DestinySandboxPerkDefinition");
    var items = res.filter(sift({ "displayProperties.name": itemName }));
    return items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
