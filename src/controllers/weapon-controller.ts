import {
  DestinyItemSocketBlockDefinition,
  DestinyItemSocketEntryDefinition,
} from "bungie-api-ts/destiny2";
import Discord from "discord.js";
import WeaponCommand from "../models/commands/weapon-command";
import {
  DamageType,
  PlugCategory,
  SocketCategoryHash,
  WeaponBase,
  WeaponTierType,
} from "../models/constants";
import Perk from "../models/destiny-entities/perk";
import Socket from "../models/destiny-entities/socket";
import {
  WeaponBaseArchetype,
  WeaponRawData,
} from "../models/destiny-entities/weapon";
import ManifestDBService from "../services/manifest-db-service";
import {
  getInventoryItemByHash,
  getInventoryItemsByHashes,
  getInventoryItemsByName,
} from "../services/manifest/inventory-item-service";
import {
  getPlugItemHash,
  getPlugItemsByHash,
} from "../services/manifest/plugset-service";
import getPowerCap from "../services/manifest/power-cap-service";
import { getSocketTypeHash } from "../services/manifest/socket-type-service";
import {
  orderResultsByName,
  orderResultsByRandomOrTierType,
} from "../utils/utils";
import { logger } from "../services/logger-service";

const _logger = logger.getChildLogger({ name: "Weapon" });

export default class WeaponController {
  dbService: ManifestDBService;

  constructor(dbService?: ManifestDBService) {
    this.dbService = dbService ?? new ManifestDBService();
  }

  async processWeaponCommand(
    input: string,
    options: Discord.CommandInteractionOptionResolver
  ): Promise<WeaponCommand | undefined> {
    if (input) {
      const weaponCommand = new WeaponCommand(input, options);
      const results = await getInventoryItemsByName(this.dbService.db, input);
      weaponCommand.processWeaponResults(results);
      for (const weapon of weaponCommand.weaponResults) {
        const powerCapValues = await getPowerCap(
          this.dbService.db,
          weapon.rawData.powerCapHashes
        );
        weapon.setPowerCapValues(powerCapValues);
        const [sockets, intrinsic] = await this.processSocketData(
          weaponCommand.options.isDefault,
          weapon.rawData.socketData
        );
        const baseArchetype = await processBaseArchetype(
          weapon.rawData,
          intrinsic
        );
        if (weapon.powerCapValues)
          baseArchetype.powerCap = Math.max(...weapon.powerCapValues);
        else throw Error("Failed to set power cap values");
        weapon.setBaseArchetype(baseArchetype);
        weapon.setSockets(sockets);
      }

      const orderedResults = orderResultsByRandomOrTierType(
        weaponCommand.weaponResults
      );

      weaponCommand.setWeaponResults(orderResultsByName(input, orderedResults));

      return weaponCommand;
    }
    return;
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
      logger.error(
        "reusablePlugSetHash not found in socket entry for intrinisic"
      );
      return;
    }

    const plugItemHash = await getPlugItemHash(
      this.dbService.db,
      socketEntry.reusablePlugSetHash
    );

    const item = await getInventoryItemByHash(this.dbService.db, plugItemHash);
    const plugCategoryHash = item.plug?.plugCategoryHash;
    if (plugCategoryHash) {
      const category = PlugCategory[plugCategoryHash] as
        | keyof typeof PlugCategory
        | undefined;
      if (!category) {
        _logger.error(
          "Unknown plug category hash for intrinsic:",
          plugCategoryHash
        ); // expect only one valid intrinsic and should be matched accordingly
        return;
      }
      return new Perk(item, category);
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

      const plugCategoryHash = await getSocketTypeHash(
        this.dbService.db,
        socketTypeHash
      );
      const plugCategory = PlugCategory[plugCategoryHash] as
        | keyof typeof PlugCategory
        | undefined;
      if (!plugCategory) continue;

      if (isDefault) {
        const defaultPlugHashes = socket.reusablePlugItems.map(
          (x) => x.plugItemHash
        );
        defaultPlugHashes.push(socket.singleInitialItemHash);

        const results = await getInventoryItemsByHashes(
          this.dbService.db,
          defaultPlugHashes
        );
        const defaultPerks = [];
        for (const result of results) {
          defaultPerks.push(new Perk(result, plugCategory));
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
      if (socket.randomizedPlugSetHash)
        plugSetHash = socket.randomizedPlugSetHash;
      else if (socket.reusablePlugItems)
        plugSetHash = socket.reusablePlugSetHash;
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

      const plugItems = await getPlugItemsByHash(
        this.dbService.db,
        plugSetHash
      );

      const perks = [];
      const items = await getInventoryItemsByHashes(
        this.dbService.db,
        plugItems.map((x) => x.plugItemHash)
      );
      for (let i = 0; i < plugItems.length; i++) {
        const currentItem = items.find(
          (x) => x.hash == plugItems[i].plugItemHash
        );
        if (currentItem)
          perks.push(
            new Perk(currentItem, plugCategory, plugItems[i].currentlyCanRoll)
          );
        else throw Error("plugset item can not be found");
      }
      sockets.push(new Socket(orderIdx, plugCategory, plugCategoryHash, perks));
    }
    return isDefault ? defaultSockets : sockets;
  }
}

export async function processBaseArchetype(
  weaponRawData: WeaponRawData,
  intrinsic?: Perk
): Promise<WeaponBaseArchetype> {
  let weaponBase: keyof typeof WeaponBase | undefined;
  let weaponClass: keyof typeof WeaponBase | undefined;
  let weaponTierType: keyof typeof WeaponTierType | undefined;
  let isKinetic = false;
  for (const hash of weaponRawData.itemCategoryHashes.sort().slice(1)) {
    const category = WeaponBase[hash] as keyof typeof WeaponBase | undefined;
    if (category) {
      // runtime check
      if (hash < 5) {
        weaponBase = category;
        isKinetic = hash <= 2;
      } else weaponClass = category;
    }
  }
  if (!weaponBase) throw Error("Failed to parse weapon base class"); // also accounts for isEnergy
  if (!weaponClass) throw Error("Failed to parse weapon class");

  const tierTypeHash = weaponRawData.weaponTierTypeHash;
  if (tierTypeHash)
    weaponTierType = WeaponTierType[tierTypeHash] as
      | keyof typeof WeaponTierType
      | undefined;
  else throw Error("Weapon tier type hash is invalid");
  if (!weaponTierType)
    throw Error(`Failed to parse tier type hash ${tierTypeHash}`);

  const weaponDamageTypeId = weaponRawData.weaponDamageTypeId;
  const damageType = DamageType[weaponDamageTypeId] as
    | keyof typeof DamageType
    | undefined;
  if (!damageType)
    throw Error(`Failed to parse damage type hash ${weaponDamageTypeId}`);

  const baseArchetype = new WeaponBaseArchetype(
    weaponRawData.name,
    weaponBase,
    weaponClass,
    weaponTierType,
    damageType,
    isKinetic,
    intrinsic
  );

  return baseArchetype;
}
