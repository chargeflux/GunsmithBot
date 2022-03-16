import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import PerkOptions from "../models/command-options/perkOptions";
import PerkCommand from "../models/commands/perkCommand";
import { PlugCategory } from "../models/constants";
import Perk from "../models/destiny-entities/perk";
import ManifestDBService from "../services/manifestDbService";
import { getInventoryItemsByName } from "../services/manifest/inventoryItemService";
import BaseController from "./baseController";

export default class PerkController implements BaseController<PerkOptions, PerkCommand, Perk> {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }
  processOptions(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
  ): PerkOptions {
    return new PerkOptions(options.getBoolean("enhanced") ?? false);
  }

  async processQuery(input?: string, options?: PerkOptions): Promise<PerkCommand | undefined> {
    let perkCommand = undefined;
    const perkResults = [];
    const isEnhanced = options?.enhanced;
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);
      for (const result of results) {
        const perk = this.validateResult(result);
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

  validateResult(result: DestinyInventoryItemDefinition): Perk | undefined {
    if (result.plug?.plugCategoryHash) {
      const plugCategoryName = PlugCategory[result.plug?.plugCategoryHash] as
        | keyof typeof PlugCategory
        | undefined;
      if (!plugCategoryName) return; // runtime check
      return new Perk(result, plugCategoryName, true);
    }
  }
}
