import ModCommand from "../models/commands/mod-command";
import Mod from "../models/destiny-entities/mod";
import ManifestDBService from "../services/manifest-db-service";
import { getCollectibleByHash } from "../services/manifest/collectible-service";
import { getInventoryItemsByName } from "../services/manifest/inventory-item-service";
import { getSandboxPerksByHashes } from "../services/manifest/sandbox-perk-service";
import { orderResultsByName } from "../utils/utils";

export default class ModController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processModCommand(input?: string): Promise<Mod[]> {
    if (input) {
      var modCommand = new ModCommand(input);
      const results = await getInventoryItemsByName(this.dbService.db, input);
      modCommand.processResults(results);

      for (let mod of modCommand.modResults) {
        let sandboxPerks = await getSandboxPerksByHashes(
          this.dbService.db,
          mod.perkHashes
        );
        mod.setDescription(sandboxPerks);
        if (mod.collectibleHash) {
          let collectible = await getCollectibleByHash(
            this.dbService.db,
            mod.collectibleHash
          );
          mod.setSource(collectible.sourceString);
        }
      }

      var modResults = orderResultsByName(input, modCommand.modResults);
      return modResults;
    }
    return [];
  }
}
