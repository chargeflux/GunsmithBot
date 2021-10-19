import sift from "sift";
import { getManifestTableData } from "./manifest-service";

export default async function getPowerCap(hashes: number[]): Promise<number[]> {
  try {
    var res = await getManifestTableData("DestinyPowerCapDefinition");
    var items = res.filter(sift({ hash: { $in: hashes } }));
    return items
      .map((x) => x.powerCap)
      .sort()
      .reverse(); // newest first
  } catch (err) {
    console.error(err);
    throw err;
  }
}
