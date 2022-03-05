import Discord from "discord.js";
import fuzzysort from "fuzzysort";
import SearchCommand, { ValidTraitsOptions } from "../models/commands/search-command";
import { WeaponCommandOptions } from "../models/commands/weapon-command";
import { PlugCategory } from "../models/constants";
import {
  DestinyInventoryItemDefinitionRecord,
  PerkWeaponHashMap,
  WeaponDBTables,
} from "../models/db";
import Perk from "../models/destiny-entities/perk";
import Socket from "../models/destiny-entities/socket";
import PublicError from "../models/errors/PublicError";
import ManifestDBService from "../services/manifest-db-service";
import { getInventoryItemsByHashes } from "../services/manifest/inventory-item-service";
import { getFuzzyQueryNames, getWeaponsByExactName } from "../services/manifest/search-service";
import WeaponDBService, {
  WeaponTable,
  WeaponTableHash,
  WeaponTables,
} from "../services/weapon-db-service";
import { validateWeaponSearch } from "../utils/utils";
import { stringIs } from "../utils/validator";
import WeaponController from "./weapon-controller";

export default class SearchController {
  dbService: ManifestDBService;
  weaponDBService: WeaponDBService;

  constructor(dbService?: ManifestDBService, weaponDBService?: WeaponDBService) {
    this.dbService = dbService ?? new ManifestDBService();
    this.weaponDBService = weaponDBService ?? new WeaponDBService();
  }

  async processSearchQuery(
    options: Discord.CommandInteractionOptionResolver
  ): Promise<SearchCommand> {
    const searchCommand = new SearchCommand(options);
    const traitWeaponIds = new Set<number>();
    let weaponIds = new Set<number>();
    const queryStringComponents: string[] = [];
    for (const perk of WeaponTables) {
      const query = searchCommand.perksToSearch[perk];
      if (!query) continue;
      const exactQuery = await this.narrowFuzzyQuery(perk, query);
      if (!exactQuery) throw Error("Could not narrow query: " + query);
      // Second DB call could be collapsed into first DB call but probably unnecessary
      const weaponHashIds = await getWeaponsByExactName(this.weaponDBService.db, perk, exactQuery);
      if (searchCommand.traitState == ValidTraitsOptions.Traits1AndTraits2) {
        for (const hash of weaponHashIds) traitWeaponIds.add(hash);
      } else if (searchCommand.traitState == ValidTraitsOptions.Traits1) {
        const weaponHashIds2 = await getWeaponsByExactName(
          this.weaponDBService.db,
          "traits2",
          exactQuery
        );
        for (const hash of weaponHashIds) traitWeaponIds.add(hash);
        for (const hash of weaponHashIds2) traitWeaponIds.add(hash);
      } else {
        const currentSocketWeaponIds = new Set<number>();
        for (const hash of weaponHashIds) currentSocketWeaponIds.add(hash);
        if (weaponIds.size > 0) {
          if (currentSocketWeaponIds.size > 0) {
            weaponIds = new Set(Array.from(weaponIds).filter((x) => currentSocketWeaponIds.has(x)));
          }
        } else weaponIds = currentSocketWeaponIds;
      }
      queryStringComponents.push(perk + ": " + exactQuery);
    }
    if (queryStringComponents.length == 0) {
      // TODO: Implement archetype only search
      throw new PublicError(
        "Querying by archetype only is not implemented. Please specify a perk to narrow results"
      );
    }
    searchCommand.setInput(queryStringComponents.join(", "));
    let finalIds;
    if (weaponIds.size > 0) {
      if (traitWeaponIds.size > 0)
        finalIds = Array.from(traitWeaponIds).filter((x) => weaponIds.has(x));
      else finalIds = Array.from(weaponIds);
    } else finalIds = Array.from(traitWeaponIds);
    const results = await getInventoryItemsByHashes(this.dbService.db, finalIds);

    const weaponController = new WeaponController(this.dbService);
    for (const result of results) {
      const newWeapon = await weaponController.createWeapon(
        result,
        new WeaponCommandOptions(),
        true
      );

      if (newWeapon.baseArchetype) {
        searchCommand.validateAndAddResult(newWeapon.baseArchetype);
      }
    }
    return searchCommand;
  }

  private async narrowFuzzyQuery(type: WeaponTable, query: string) {
    const results = await getFuzzyQueryNames(this.weaponDBService.db, type, query);
    const bestResult = fuzzysort.go(query, results, {
      allowTypo: false,
    })[0];
    if (bestResult) return bestResult.target;
    else return "";
  }

  async createWeaponTables(weaponItems: DestinyInventoryItemDefinitionRecord[]) {
    let weaponDBTables: WeaponDBTables = {
      intrinsics: undefined,
      stocks: undefined,
      traits1: undefined,
      traits2: undefined,
      barrels: undefined,
      bowstrings: undefined,
      magazines: undefined,
      projectiles: undefined,
      blades: undefined,
      grips: undefined,
      batteries: undefined,
      guards: undefined,
      scopes: undefined,
      arrows: undefined,
      launchers: undefined,
    };
    const weaponController = new WeaponController(this.dbService);
    for (const weapon of weaponItems) {
      if (!validateWeaponSearch(weapon.data)) continue;
      const [sockets, intrinsic] = await weaponController.processSocketData(
        false,
        weapon.data.sockets
      );
      sockets.push(
        new Socket(sockets.length, intrinsic.category, PlugCategory.Intrinsics, [intrinsic])
      );
      let traits1Completed = false;
      for (const socket of sockets) {
        if (socket.name == PlugCategory[PlugCategory.Traits]) {
          if (!traits1Completed) {
            for (const perk of socket.perks) {
              weaponDBTables = this.createDBTableRecord(
                weaponDBTables,
                "traits1",
                weapon.hash,
                perk
              );
            }
            traits1Completed = true;
          } else {
            for (const perk of socket.perks) {
              weaponDBTables = this.createDBTableRecord(
                weaponDBTables,
                "traits2",
                weapon.hash,
                perk
              );
            }
          }
        } else {
          for (const perk of socket.perks) {
            const socketTypeName = WeaponTableHash[socket.hash];
            if (stringIs<WeaponTable>(socketTypeName, WeaponTables))
              weaponDBTables = this.createDBTableRecord(
                weaponDBTables,
                socketTypeName,
                weapon.hash,
                perk
              );
          }
        }
      }
    }
    return weaponDBTables;
  }

  private createDBTableRecord(
    weaponDBTables: WeaponDBTables,
    tableName: WeaponTable,
    weaponHash: string,
    perk: Perk
  ) {
    let data = weaponDBTables[tableName];
    if (!data) {
      const newRecordData: PerkWeaponHashMap = {};
      newRecordData[perk.hash.toString()] = [perk.name, new Set<string>().add(weaponHash)];
      data = newRecordData;
    } else if (data[perk.hash.toString()]) {
      const existing = data[perk.hash.toString()];
      existing[1] = existing[1].add(weaponHash);
      data[perk.hash] = existing;
    } else {
      const newRecordData: [string, Set<string>] = [perk.name, new Set<string>().add(weaponHash)];
      data[perk.hash.toString()] = newRecordData;
    }
    weaponDBTables[tableName] = data;
    return weaponDBTables;
  }
}
