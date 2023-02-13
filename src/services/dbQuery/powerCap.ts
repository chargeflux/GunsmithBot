import { ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { logger } from "../../logger";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getSubLogger({ name: "PowerCapService" });

export default async function getPowerCap(db: ManifestDB, hashes: number[]): Promise<number[]> {
  try {
    const result: ManifestTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinyPowerCapDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return result
      .map((x) => JSON.parse(x.json).powerCap)
      .sort()
      .reverse(); // newest first
  } catch (e) {
    _logger.error("Failed to get power cap levels", e);
    return [];
  }
}
