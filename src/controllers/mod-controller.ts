import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import ModCommand from "../models/commands/mod-command";
import { ModCategory } from "../models/constants";
import Mod from "../models/destiny-entities/mod";
import ManifestDBService from "../services/manifest-db-service";
import { getCollectibleByHash } from "../services/manifest/collectible-service";
import { getInventoryItemsByName } from "../services/manifest/inventory-item-service";
import { getSandboxPerksByHashes } from "../services/manifest/sandbox-perk-service";
import { logger } from "../services/logger-service";

const _logger = logger.getChildLogger({ name: "ModController" });

export default class ModController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processModQuery(input?: string): Promise<Mod[]> {
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);

      const modResults = [];
      for (const result of results) {
        if (!this.validateMod(result)) continue;

        const sandboxPerks = await getSandboxPerksByHashes(
          this.dbService.db,
          result.perks.map((x) => x.perkHash)
        );
        let source = "";
        if (result.collectibleHash) {
          const collectible = await getCollectibleByHash(
            this.dbService.db,
            result.collectibleHash
          );
          source = collectible.sourceString;
        }
        modResults.push(new Mod(result, sandboxPerks, source));
      }
      const modCommand = new ModCommand(input, modResults);
      return modCommand.results;
    }
    return [];
  }

  validateMod(result: DestinyInventoryItemDefinition) {
    if (!result.itemCategoryHashes) return false;
    if (result.perks.length == 0) return false;
    if (!result.itemCategoryHashes.includes(ModCategory.Mods)) return false;
    if (result.itemCategoryHashes.includes(ModCategory["Bonus Mods"]))
      // Armor perks from Armor 1.0
      return false;
    if (result.itemCategoryHashes.includes(ModCategory.WeaponDamage))
      return true;
    else if (result.itemCategoryHashes.includes(ModCategory.Armor)) return true;
    else if (result.traitHashes?.includes(ModCategory.Aspect)) return true;
    else if (result.traitHashes?.includes(ModCategory.Fragment)) return true;
    else {
      _logger.debug(
        "Could not identify mod category hashes: " +
          result.itemCategoryHashes +
          " - " +
          result.displayProperties.name
      );
      return false;
    }
  }
}
