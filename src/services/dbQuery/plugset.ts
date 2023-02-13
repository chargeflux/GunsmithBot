import {
  DestinyItemSocketEntryPlugItemRandomizedDefinition,
  DestinyPlugSetDefinition,
} from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getSubLogger({ name: "PlugsetService" });

export async function getPlugItemHash(db: ManifestDB, hash: number): Promise<number> {
  try {
    const result: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinyPlugSetDefinition WHERE hash = ?")
      .get(hash.toString());
    const jsonRes: DestinyPlugSetDefinition = JSON.parse(result.json);
    return jsonRes.reusablePlugItems[0].plugItemHash;
  } catch (e) {
    _logger.error("Failed to get plugItemHash");
    throw e;
  }
}

export async function getPlugItemsByHash(
  db: ManifestDB,
  hash: number
): Promise<DestinyItemSocketEntryPlugItemRandomizedDefinition[]> {
  try {
    const result: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinyPlugSetDefinition WHERE hash = ?")
      .get(hash.toString());
    const json_res: DestinyPlugSetDefinition = JSON.parse(result.json);
    return json_res.reusablePlugItems;
  } catch (e) {
    _logger.error("Failed to get plugItems by hash", e);
    throw e;
  }
}
