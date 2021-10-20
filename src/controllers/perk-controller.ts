import PerkCommand from "../models/commands/perk-command";
import Perk from "../models/destiny-entities/perk";
import DBService from "../services/db-service";
import { getInventoryItemsByName } from "../services/manifest/inventory-item-service";
import { orderResultsByName } from "../utils/utils";

export default class PerkController {
  dbService: DBService;

  constructor(dbService: DBService) {
    this.dbService = dbService;
  }

  async processPerkCommand(input?: string): Promise<Perk[]> {
    if (input) {
      var perkCommand = new PerkCommand(input);
      const results = await getInventoryItemsByName(this.dbService.db, input);
      await perkCommand.processResults(results);
      var perkResults = orderResultsByName(input, perkCommand.perkResults);
      return perkResults;
    }
    return [];
  }
}
