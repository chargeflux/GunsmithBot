import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import ModCommand from "../models/commands/modCommand";
import { ModCategory } from "../models/constants";
import Mod from "../models/destiny-entities/mod";
import ManifestDBService from "../services/manifestDbService";
import { getCollectibleByHash } from "../services/dbQuery/collectible";
import { getInventoryItemsByName } from "../services/dbQuery/inventoryItem";
import { getSandboxPerksByHashes } from "../services/dbQuery/sandboxPerk";
import { logger } from "../logger";
import BaseController from "./baseController";
import ModOptions from "../models/command-options/modOptions";

const _logger = logger.getChildLogger({ name: "ModController" });

export default class ModController implements BaseController<ModOptions, ModCommand, Mod> {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processQuery(input?: string): Promise<ModCommand | undefined> {
    let modCommand;
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);
      const modResults = [];
      for (const result of results) {
        if (!this.validateResult(result)) continue;

        const sandboxPerks = await getSandboxPerksByHashes(
          this.dbService.db,
          result.perks.map((x) => x.perkHash)
        );
        let source = "";
        if (result.collectibleHash) {
          const collectible = await getCollectibleByHash(this.dbService.db, result.collectibleHash);
          source = collectible.sourceString;
        }
        modResults.push(new Mod(result, sandboxPerks, source));
      }
      modCommand = new ModCommand(input, modResults);
    }
    return modCommand;
  }

  validateResult(result: DestinyInventoryItemDefinition) {
    if (!result.itemCategoryHashes) return false;
    if (result.perks.length == 0) return false;
    if (!result.itemCategoryHashes.includes(ModCategory.Mods)) return false;
    if (result.itemCategoryHashes.includes(ModCategory["Bonus Mods"]))
      // Armor perks from Armor 1.0
      return false;
    if (result.itemCategoryHashes.includes(ModCategory.WeaponDamage)) return true;
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
