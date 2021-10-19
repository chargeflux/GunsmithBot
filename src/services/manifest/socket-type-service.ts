import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export async function getSocketTypeHash(hash: number): Promise<number> {
  try {
    var res = await getManifestTableData("DestinySocketTypeDefinition");
    var item = res.filter(sift({ hash: hash }));
    return item[0].plugWhitelist[0].categoryHash; // assume plugWhiteList has length of 1
  } catch (err) {
    console.error(err);
    throw err;
  }
}
