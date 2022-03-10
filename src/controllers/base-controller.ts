import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { CacheType, CommandInteractionOptionResolver } from "discord.js";

export default interface BaseController<BaseOptions, BaseCommand, BaseMetadata> {
  processOptions?(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
  ): BaseOptions;
  processQuery(input?: string): Promise<BaseCommand | undefined>;
  processQuery(input?: string, options?: BaseOptions): Promise<BaseCommand | undefined>;
  validateResult(result: DestinyInventoryItemDefinition): boolean | (BaseMetadata | undefined);
}
