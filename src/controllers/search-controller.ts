import fuzzysort from "fuzzysort";
import { PlugCategory, WeaponBase, WeaponTierType } from "../models/constants";
import {
  DBTableRecordResultAllWeaponsParsed,
  WeaponDBTable,
  WeaponDBTableRecord,
} from "../models/db";
import Perk from "../models/destiny-entities/perk";
import Socket from "../models/destiny-entities/socket";
import ManifestDBService from "../services/manifest-db-service";
import {
  getInventoryItemsByHashes,
  getInventoryItemsWeapons,
} from "../services/manifest/inventory-item-service";
import {
  getFuzzyQueryNames,
  getWeaponsByExactName,
} from "../services/manifest/search-service";
import WeaponDBService, {
  WeaponTable,
  WeaponTables,
  WeaponTableHash,
} from "../services/weapon-db-service";
import { validateWeaponSearch } from "../utils/utils";
import WeaponController, { processBaseArchetype } from "./weapon-controller";
import Discord from "discord.js";
import SearchCommand, {
  ValidTraitsOptions,
} from "../models/commands/search-command";
import { MinimalWeapon } from "../models/destiny-entities/weapon";
import getPowerCap from "../services/manifest/power-cap-service";
import { stringIs } from "../utils/validator";

export default class SearchController {
  dbService: ManifestDBService;
  weaponDBService: WeaponDBService;

  constructor(
    dbService?: ManifestDBService,
    weaponDBService?: WeaponDBService
  ) {
    this.dbService = dbService ?? new ManifestDBService();
    this.weaponDBService = weaponDBService ?? new WeaponDBService();
  }

  async processSearchCommand(
    options: Discord.CommandInteractionOptionResolver
  ): Promise<SearchCommand> {
    var searchCommand = new SearchCommand(options);
    let traitWeaponIds = new Set<number>();
    let weaponIds = new Set<number>();
    let queryStringComponents: string[] = [];
    for (let perk of WeaponTables) {
      let query = searchCommand.perksToSearch[perk];
      if (!query) continue;
      let exactQuery = await this.narrowFuzzyQuery(perk, query);
      if (!exactQuery) throw Error("Could not narrow query: " + query);
      // Second DB call could be collapsed into first DB call but probably unnecessary
      let weaponHashIds = await getWeaponsByExactName(
        this.weaponDBService.db,
        perk,
        exactQuery
      );
      if (searchCommand.traitState == ValidTraitsOptions.Traits1AndTraits2) {
        for (let hash of weaponHashIds) traitWeaponIds.add(hash);
      } else if (searchCommand.traitState == ValidTraitsOptions.Traits1) {
        let weaponHashIds2 = await getWeaponsByExactName(
          this.weaponDBService.db,
          "traits2",
          exactQuery
        );
        for (let hash of weaponHashIds) traitWeaponIds.add(hash);
        for (let hash of weaponHashIds2) traitWeaponIds.add(hash);
      } else {
        let currentSocketWeaponIds = new Set<number>();
        for (let hash of weaponHashIds) currentSocketWeaponIds.add(hash);
        if (weaponIds.size > 0) {
          if (currentSocketWeaponIds.size > 0) {
            weaponIds = new Set(
              Array.from(weaponIds).filter((x) => currentSocketWeaponIds.has(x))
            );
          }
        } else weaponIds = currentSocketWeaponIds;
      }
      queryStringComponents.push(perk + ": " + exactQuery);
    }
    searchCommand.setInput(queryStringComponents.join(", "));
    let finalIds;
    if (weaponIds.size > 0) {
      if (traitWeaponIds.size > 0)
        finalIds = Array.from(traitWeaponIds).filter((x) => weaponIds.has(x));
      else finalIds = Array.from(weaponIds);
    } else finalIds = Array.from(traitWeaponIds);
    let results = await getInventoryItemsByHashes(this.dbService.db, finalIds);
    for (let result of results) {
      let weapon = new MinimalWeapon(result);
      let powerCapValues = await getPowerCap(
        this.dbService.db,
        weapon.rawData.powerCapHashes
      );

      let baseArchetype = await processBaseArchetype(weapon.rawData);
      weapon.setPowerCapValues(powerCapValues);
      if (weapon.powerCapValues)
        baseArchetype.powerCap = Math.max(...weapon.powerCapValues);
      weapon.setBaseArchetype(baseArchetype);
      if (baseArchetype) {
        searchCommand.validateAndAddResult(baseArchetype);
      }
    }
    return searchCommand;
  }

  private async narrowFuzzyQuery(type: WeaponTable, query: string) {
    let results = await getFuzzyQueryNames(
      this.weaponDBService.db,
      type,
      query
    );
    const bestResult = fuzzysort.go(query, results, {
      allowTypo: false,
    })[0];
    if (bestResult) return bestResult.target;
    else return "";
  }

  async createWeaponTables(weaponController: WeaponController) {
    let weaponItems: DBTableRecordResultAllWeaponsParsed[] =
      await getInventoryItemsWeapons(this.dbService.db);

    let weaponSocketData: WeaponDBTable = {
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
    for (let weapon of weaponItems) {
      if (!validateWeaponSearch(weapon.data)) continue;
      let [sockets, intrinsic] = await weaponController.processSocketData(
        false,
        weapon.data.sockets
      );
      sockets.push(
        new Socket(
          sockets.length,
          intrinsic.category,
          PlugCategory.Intrinsics,
          [intrinsic]
        )
      );
      let traits1Completed = false;
      for (let socket of sockets) {
        if (socket.name == PlugCategory[PlugCategory.Traits]) {
          if (!traits1Completed) {
            for (let perk of socket.perks) {
              weaponSocketData = createDBTableRecord(
                weaponSocketData,
                "traits1",
                weapon.hash,
                perk
              );
            }
            traits1Completed = true;
          } else {
            for (let perk of socket.perks) {
              weaponSocketData = createDBTableRecord(
                weaponSocketData,
                "traits2",
                weapon.hash,
                perk
              );
            }
          }
        } else {
          for (let perk of socket.perks) {
            const socketTypeName = WeaponTableHash[socket.hash];
            if (stringIs<WeaponTable>(socketTypeName, WeaponTables))
              weaponSocketData = createDBTableRecord(
                weaponSocketData,
                socketTypeName,
                weapon.hash,
                perk
              );
          }
        }
      }
    }
    return weaponSocketData;
  }
}

function createDBTableRecord(
  weaponSocketData: WeaponDBTable,
  tableName: WeaponTable,
  weaponHash: string,
  perk: Perk
) {
  let data = weaponSocketData[tableName];
  if (!data) {
    let newRecordData: WeaponDBTableRecord = {};
    newRecordData[perk.hash.toString()] = [
      perk.name,
      new Set<string>().add(weaponHash),
    ];
    data = newRecordData;
  } else if (data[perk.hash.toString()]) {
    let existing = data[perk.hash.toString()];
    existing[1] = existing[1].add(weaponHash);
    data[perk.hash] = existing;
  } else {
    let newRecordData: [string, Set<string>] = [
      perk.name,
      new Set<string>().add(weaponHash),
    ];
    data[perk.hash.toString()] = newRecordData;
  }
  weaponSocketData[tableName] = data;
  return weaponSocketData;
}
