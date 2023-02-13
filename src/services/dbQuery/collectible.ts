import { DestinyCollectibleDefinition } from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getSubLogger({ name: "CollectibleService" });

export async function getCollectibleByHash(
  db: ManifestDB,
  hash: number
): Promise<DestinyCollectibleDefinition> {
  try {
    const item: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinyCollectibleDefinition WHERE hash=?")
      .get(hash.toString());
    return JSON.parse(item.json);
  } catch (e) {
    _logger.error("Failed to get collectible by hash");
    throw e;
  }
}
