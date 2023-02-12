import { DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { ManifestTableRecordJSON } from "../../models/database/manifestTable";
import { ManifestDB } from "../manifestDbService";

const _logger = logger.getSubLogger({ name: "SandboxPerkService" });

export async function getSandboxPerksByName(
  db: ManifestDB,
  query: string
): Promise<DestinySandboxPerkDefinition[]> {
  try {
    const items: ManifestTableRecordJSON[] = db
      .prepare("SELECT json FROM DestinySandboxPerkDefinition WHERE name LIKE ?")
      .all("%" + query + "%");
    return items.map((x) => JSON.parse(x.json));
  } catch (e) {
    _logger.error("Failed to get sandbox perk by name", e);
    throw e;
  }
}

export async function getSandboxPerksByHashes(
  db: ManifestDB,
  hashes: number[]
): Promise<DestinySandboxPerkDefinition[]> {
  try {
    const items: ManifestTableRecordJSON[] = db
      .prepare(
        `SELECT json FROM DestinySandboxPerkDefinition WHERE hash in (${"?,"
          .repeat(hashes.length)
          .slice(0, -1)})`
      )
      .all(hashes.map((x) => x.toString()));
    return items.map((x) => JSON.parse(x.json));
  } catch (e) {
    _logger.error("Failed to get sandbox perk by hash", e);
    throw e;
  }
}
