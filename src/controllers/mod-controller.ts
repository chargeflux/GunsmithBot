import ModCommand from "../models/commands/mod-command";
import Mod from "../models/destiny-entities/mod";
import DBService from "../services/db-service";
import { getCollectibleByHash } from "../services/manifest/collectible-service";
import { getInventoryItemsByName } from "../services/manifest/inventory-item-service";
import { getSandboxPerkByHash } from "../services/manifest/sandbox-perk-service";
import { orderResultsByName } from "../utils/utils";

export default class ModController {
  dbService: DBService;

  constructor(dbService: DBService) {
    this.dbService = dbService;
  }

  async processModCommand(input?: string): Promise<Mod[]> {
    if (input) {
      var modCommand = new ModCommand(input);
      const results = await getInventoryItemsByName(this.dbService.db, input);
      modCommand.processResults(results);

      for (let mod of modCommand.modResults) {
        let sandboxPerks = await getSandboxPerkByHash(
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
