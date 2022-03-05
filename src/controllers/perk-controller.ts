import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { CacheType, CommandInteractionOptionResolver } from "discord.js";
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

  async processPerkQuery(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">,
    input?: string
  ): Promise<PerkCommand | undefined> {
    let perkCommand = undefined;
    const perkResults = [];
    const isEnhanced = options.getBoolean("enhanced") ?? false;
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);
      for (const result of results) {
        const perk = this.parseResult(result);
        if (perk) {
          if (perk.isEnhanced == isEnhanced) {
            perkResults.push(perk);
          }
        }
      }
      perkCommand = new PerkCommand(input, perkResults);
    }
    return perkCommand;
  }

  parseResult(result: DestinyInventoryItemDefinition): Perk | undefined {
    if (result.plug?.plugCategoryHash) {
      const plugCategoryName = PlugCategory[result.plug?.plugCategoryHash] as
        | keyof typeof PlugCategory
        | undefined;
      if (!plugCategoryName) return; // runtime check
      return new Perk(result, plugCategoryName, true);
    }
  }
}
