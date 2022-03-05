import {
  DestinyInventoryItemDefinition,
  DestinyItemSocketBlockDefinition,
  DestinyItemSocketEntryDefinition,
} from "bungie-api-ts/destiny2";
import ArmorCommand from "../models/commands/armor-command";
import { ArmorType, PlugCategory, SocketCategoryHash } from "../models/constants";
import { Armor } from "../models/destiny-entities/armor";
import Perk from "../models/destiny-entities/perk";
import { logger } from "../services/logger-service";
import ManifestDBService from "../services/manifest-db-service";
import { getCollectibleByHash } from "../services/manifest/collectible-service";
import {
  getInventoryItemByHash,
  getInventoryItemsByName,
} from "../services/manifest/inventory-item-service";
import { getPlugItemHash } from "../services/manifest/plugset-service";
import getPowerCap from "../services/manifest/power-cap-service";

const _logger = logger.getChildLogger({ name: "WeaponController" });

export default class ArmorController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processArmorQuery(input: string): Promise<ArmorCommand | undefined> {
    let armorCommand;
    if (input) {
      const results = await getInventoryItemsByName(this.dbService.db, input);
      const armorResults: Armor[] = [];
      for (const result of results) {
        if (!this.validateArmor(result)) continue;
        let source = "";
        if (result.collectibleHash) {
          const collectible = await getCollectibleByHash(this.dbService.db, result.collectibleHash);
          source = collectible.sourceString;
        }
        const armor = await this.createArmor(result, source);
        armorResults.push(armor);
      }
      armorCommand = new ArmorCommand(input, armorResults);
    }
    return armorCommand;
  }

  async createArmor(armorData: DestinyInventoryItemDefinition, source: string) {
    const powerCapValues = await this.getPowerCapValues(armorData);
    const intrinisic = await this.processSocketData(armorData.sockets);
    const armor = new Armor(armorData, powerCapValues, source, intrinisic);
    return armor;
  }

  async getPowerCapValues(rawArmorData: DestinyInventoryItemDefinition): Promise<number[]> {
    const powerCapHashes = rawArmorData.quality?.versions.map((x) => x.powerCapHash) ?? [];

    const powerCapValues = await getPowerCap(this.dbService.db, powerCapHashes);
    return powerCapValues;
  }

  async processSocketData(
    socketData?: DestinyItemSocketBlockDefinition
  ): Promise<Perk | undefined> {
    if (!socketData) {
      throw Error("Failed to retrieve Socket Data for armor");
    }
    let intrinsic;
    for (const category of socketData.socketCategories) {
      if (category.socketCategoryHash == SocketCategoryHash.ArmorPerks) {
        const index = category.socketIndexes[category.socketIndexes.length - 1]; // assume only one intrinisic
        const socket = socketData.socketEntries[index];
        intrinsic = await this.processSocketIntrinisic(socket);
        return intrinsic;
      }
    }
  }

  private async processSocketIntrinisic(
    socketEntry: DestinyItemSocketEntryDefinition
  ): Promise<Perk | undefined> {
    if (!socketEntry.reusablePlugSetHash) {
      logger.error("reusablePlugSetHash not found in socket entry for intrinisic");
      return;
    }

    const plugItemHash = await getPlugItemHash(this.dbService.db, socketEntry.reusablePlugSetHash);

    const item = await getInventoryItemByHash(this.dbService.db, plugItemHash);
    const plugCategoryHash = item.plug?.plugCategoryHash;
    if (plugCategoryHash) {
      const category = PlugCategory[plugCategoryHash] as keyof typeof PlugCategory | undefined;
      if (!category) {
        _logger.error("Unknown plug category hash for intrinsic:", plugCategoryHash); // expect only one valid intrinsic and should be matched accordingly
        return;
      }
      return new Perk(item, category, true);
    }
  }

  validateArmor(result: DestinyInventoryItemDefinition) {
    if (!result.itemCategoryHashes) return false;
    if (!result.itemCategoryHashes.includes(ArmorType.Armor)) return false;
    if (!result.collectibleHash) return false;
    return true;
  }
}
