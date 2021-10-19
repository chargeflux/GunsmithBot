import PerkCommand from "../models/commands/perk-command";
import Perk from "../models/destiny-entities/perk";
import { orderResultsByName } from "../utils/utils";

export default async function processPerkCommand(
  input?: string
): Promise<Perk[]> {
  if (input) {
    var perkCommand = new PerkCommand(input);
    await perkCommand.process();
    var perkResults = orderResultsByName(input, perkCommand.perkResults);
    return perkResults;
  }
  return [];
}
