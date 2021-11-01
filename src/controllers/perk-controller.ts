import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import PerkCommand from "../models/commands/perk-command";
import { PlugCategory } from "../models/constants";
import Perk from "../models/destiny-entities/perk";
import ManifestDBService from "../services/manifest-db-service";
import { getInventoryItemsByName } from "../services/manifest/inventory-item-service";

export default class PerkController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processPerkQuery(input?: string): Promise<Perk[]> {
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);
      const perkResults = [];
      for (const result of results) {
        const perk = this.parseResult(result);
        if (perk) perkResults.push(perk);
      }
      const perkCommand = new PerkCommand(input, perkResults);
      return perkCommand.results;
    }
    return [];
  }

  parseResult(result: DestinyInventoryItemDefinition): Perk | undefined {
    if (result.plug?.plugCategoryHash) {
      const plugCategoryName = PlugCategory[result.plug?.plugCategoryHash] as
        | keyof typeof PlugCategory
        | undefined;
      if (!plugCategoryName) return; // runtime check
      return new Perk(result, plugCategoryName);
    }
  }
}
