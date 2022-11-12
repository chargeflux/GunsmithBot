import { DestinySocketTypeDefinition } from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getChildLogger({ name: "SocketService" });

export async function getSocketTypeHash(db: ManifestDB, hash: number): Promise<number> {
  try {
    const result: ManifestTableRecordJSON = db
      .prepare("SELECT json FROM DestinySocketTypeDefinition WHERE hash = ?")
      .get(hash.toString());
    const jsonRes: DestinySocketTypeDefinition = JSON.parse(result.json);
    return jsonRes.plugWhitelist[0].categoryHash; // assume plugWhiteList has length of 1
  } catch (e) {
    _logger.error("Failed to get socketTypeHash", e);
    throw e;
  }
}
