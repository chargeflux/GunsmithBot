import {
  DestinyInventoryItemDefinition,
  DestinyItemSocketBlockDefinition,
  DestinyItemSocketEntryDefinition,
} from "bungie-api-ts/destiny2";
import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import WeaponCommand, { WeaponCommandOptions } from "../models/commands/weaponCommand";
import { PlugCategory, SocketCategoryHash } from "../models/constants";
import Perk from "../models/destiny-entities/perk";
import Socket from "../models/destiny-entities/socket";
import { Weapon } from "../models/destiny-entities/weapon";
import { logger } from "../services/loggerService";
import ManifestDBService from "../services/manifestDbService";
import {
  getInventoryItemByHash,
  getInventoryItemsByHashes,
  getInventoryItemsByName,
} from "../services/manifest/inventoryItemService";
import { getPlugItemHash, getPlugItemsByHash } from "../services/manifest/plugsetService";
import getPowerCap from "../services/manifest/powerCapService";
import { getSocketTypeHash } from "../services/manifest/socketTypeService";
import { validateWeaponSearch } from "../utils/utils";

const _logger = logger.getChildLogger({ name: "WeaponController" });

export default class WeaponController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processWeaponQuery(
    input: string,
    interactionOptions: Omit<
      CommandInteractionOptionResolver<CacheType>,
      "getMessage" | "getFocused"
    >
  ): Promise<WeaponCommand | undefined> {
    let weaponCommand;
    if (input) {
      const parsedOptions = WeaponCommandOptions.parseDiscordInteractionOptions(interactionOptions);
      const results = await getInventoryItemsByName(this.dbService.db, input);
      const weaponResults: Weapon[] = [];
      for (const weaponData of results) {
        if (!validateWeaponSearch(weaponData)) continue;
        const newWeapon = await this.createWeapon(weaponData, parsedOptions);
        weaponResults.push(newWeapon);
      }
      weaponCommand = new WeaponCommand(input, parsedOptions, weaponResults);
    }
    return weaponCommand;
  }

  async createWeapon(
    weaponData: DestinyInventoryItemDefinition,
    options: WeaponCommandOptions,
    minimal = false
  ) {
    const powerCapValues = await this.getPowerCapValues(weaponData);
    let newWeapon;
    if (minimal) {
      newWeapon = new Weapon(weaponData, options, powerCapValues, []);
    } else {
      const [sockets, intrinsic] = await this.processSocketData(
        options.isDefault,
        weaponData.sockets
      );

      newWeapon = new Weapon(weaponData, options, powerCapValues, sockets, intrinsic);
    }

    return newWeapon;
  }

  async getPowerCapValues(rawWeaponData: DestinyInventoryItemDefinition): Promise<number[]> {
    const powerCapHashes = rawWeaponData.quality?.versions.map((x) => x.powerCapHash) ?? [];

    const powerCapValues = await getPowerCap(this.dbService.db, powerCapHashes);
    return powerCapValues;
  }

  async processSocketData(
    isDefault: boolean,
    socketData?: DestinyItemSocketBlockDefinition
  ): Promise<[Socket[], Perk]> {
    if (!socketData) {
      throw Error("Failed to retrieve Socket Data for weapon");
    }
    let intrinsic;
    let sockets: Socket[] = [];
    for (const category of socketData.socketCategories) {
      if (category.socketCategoryHash == SocketCategoryHash.Intrinsics) {
        const index = category.socketIndexes[0]; // assume only one intrinisic
        const socket = socketData.socketEntries[index];
        intrinsic = await this.processSocketIntrinisic(socket);
      }
      if (category.socketCategoryHash == SocketCategoryHash.WeaponPerks) {
        sockets = await this.processSocketPerks(
          socketData.socketEntries,
          category.socketIndexes,
          isDefault
        );
      }
    }
    if (!intrinsic) throw Error("Failed to determine intrinsic");

    return [sockets, intrinsic];
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

  private async processSocketPerks(
    socketEntries: DestinyItemSocketEntryDefinition[],
    socketIndices: number[],
    isDefault: boolean
  ): Promise<Socket[]> {
    const sockets: Socket[] = [];
    const defaultSockets: Socket[] = [];
    let orderIdx = 0;
    for (const index of socketIndices) {
      const socket = socketEntries[index];
      const socketTypeHash = socket.socketTypeHash;

      const plugCategoryHash = await getSocketTypeHash(this.dbService.db, socketTypeHash);
      const plugCategory = PlugCategory[plugCategoryHash] as keyof typeof PlugCategory | undefined;
      if (!plugCategory) continue;

      if (isDefault) {
        const defaultPlugHashes = socket.reusablePlugItems.map((x) => x.plugItemHash);
        defaultPlugHashes.push(socket.singleInitialItemHash);

        const results = await getInventoryItemsByHashes(this.dbService.db, defaultPlugHashes);

        const defaultPerks: Perk[] = [];
        for (const result of results) {
          defaultPerks.push(new Perk(result, plugCategory, true));
        }
        defaultSockets.push(
          new Socket(
            orderIdx,
            PlugCategory[PlugCategory.Default] + " " + plugCategory,
            plugCategoryHash,
            defaultPerks
          )
        );
        orderIdx += 1;
        continue;
      }

      let plugSetHash;
      if (socket.randomizedPlugSetHash) plugSetHash = socket.randomizedPlugSetHash;
      else if (socket.reusablePlugItems) plugSetHash = socket.reusablePlugSetHash;
      else {
        _logger.error(
          "randomizedPlugSetHash or reusablePlugSetHash not found in socket entry for weapon perks"
        );
        continue;
      }
      if (!plugSetHash) {
        _logger.debug("plugSetHash is undefined");
        continue;
      }

      const plugItems = await getPlugItemsByHash(this.dbService.db, plugSetHash);

      const perks = [];
      const items = await getInventoryItemsByHashes(
        this.dbService.db,
        plugItems.map((x) => x.plugItemHash)
      );
      for (let i = 0; i < plugItems.length; i++) {
        const currentItem = items.find((x) => x.hash == plugItems[i].plugItemHash);
        if (currentItem) {
          perks.push(new Perk(currentItem, plugCategory, plugItems[i].currentlyCanRoll));
        } else throw Error("plugset item can not be found");
      }
      sockets.push(new Socket(orderIdx, plugCategory, plugCategoryHash, perks));
    }
    return isDefault ? defaultSockets : sockets;
  }
}
