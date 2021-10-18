import PerkCommand, { PerkInfo } from "../models/commands/perk-command";
import { orderResults } from "../utils/utils";

export default async function processPerkCommand(
  input?: string
): Promise<PerkInfo[]> {
  if (input) {
    var perkCommand = new PerkCommand(input);
    await perkCommand.process();
    var perkResults = orderResults(input, perkCommand.perkInfoResults);
    return perkResults;
  }
  return [];
}
