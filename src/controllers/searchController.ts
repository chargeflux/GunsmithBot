import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import fuzzysort from "fuzzysort";
import SearchCommand, { ValidTraitsOptions } from "../models/commands/searchCommand";
import { WeaponCommandOptions } from "../models/commands/weaponCommand";
import { PlugCategory } from "../models/constants";
import {
  DestinyInventoryItemDefinitionRecord,
  PerkWeaponHashMap,
  WeaponDBTables,
} from "../models/database/weaponTable";
import Perk from "../models/destiny-entities/perk";
import Socket from "../models/destiny-entities/socket";
import PublicError from "../models/errors/publicError";
import ManifestDBService from "../services/manifestDbService";
import { getInventoryItemsByHashes } from "../services/dbQuery/inventoryItem";
import { executeSearchQuery, getFuzzyQueryNames } from "../services/dbQuery/search";
import WeaponDBService, {
  PerkType,
  WeaponTableHash,
  WeaponTables,
} from "../services/weaponDbService";
import { validateWeaponSearch } from "../utils/utils";
import { stringIs } from "../utils/validator";
import WeaponController from "./weaponController";
import { logger } from "../logger";

const _logger = logger.getChildLogger({ name: "ManifestDB" });

export default class SearchController {
  dbService: ManifestDBService;
  weaponDBService: WeaponDBService;

  constructor(dbService?: ManifestDBService, weaponDBService?: WeaponDBService) {
    this.dbService = dbService ?? new ManifestDBService();
    this.weaponDBService = weaponDBService ?? new WeaponDBService();
  }

  buildQuerySockets(perkTypes: PerkType[]) {
    const parts: string[] = [];
    for (let i = 0; i < perkTypes.length; i++) {
      if (!perkTypes[i].includes("trait")) {
        parts.push(`SELECT weaponHash FROM ${perkTypes[i]} WHERE name is ?`);
      }
    }
    return parts.join(" INTERSECT ");
  }

  buildQueryTraits(traitState: number) {
    if (traitState == ValidTraitsOptions.Traits1AndTraits2) {
      return ` INTERSECT SELECT weaponHash FROM traits1 where name is ? INTERSECT SELECT weaponHash FROM traits2 where name is ? UNION SELECT weaponHash FROM (SELECT weaponHash FROM traits2 where name is ? INTERSECT SELECT weaponHash FROM traits1 where name is ?);`;
    } else if (traitState == ValidTraitsOptions.Traits1) {
      return ` INTERSECT SELECT weaponHash FROM traits1 where name is ? UNION SELECT weaponHash FROM traits2 where name is ?;`;
    }
    return "";
  }

  async parseSearchQuery(searchCommand: SearchCommand) {
    const perksToSearch = searchCommand.perksToSearch;
    const inputParts: string[] = [];
    let queries: string[] = [];
    const perkTypes = Array.from(perksToSearch.keys()) as PerkType[];
    let stmt = this.buildQuerySockets(perkTypes);
    for (const perkType of perkTypes) {
      if (!perkType.includes("trait")) {
        const exactQuery = await this.narrowFuzzyQuery(perkType, perksToSearch.get(perkType));
        queries.push(exactQuery);
        inputParts.push(perkType + ": " + exactQuery);
      }
    }
    if (searchCommand.traitState != ValidTraitsOptions.None) {
      stmt += this.buildQueryTraits(searchCommand.traitState);
      const traits1Query = await this.narrowFuzzyQueryTraits(perksToSearch.get("traits1"));
      queries.push(traits1Query);
      inputParts.push("traits" + ": " + traits1Query);
      if (searchCommand.traitState == ValidTraitsOptions.Traits1AndTraits2) {
        const traits2Query = await this.narrowFuzzyQueryTraits(perksToSearch.get("traits2"));
        queries = queries.concat([traits2Query, traits1Query, traits2Query]);
        inputParts.push("traits" + ": " + traits2Query);
      } else {
        queries.push(traits1Query);
      }
    }

    searchCommand.setStatement(stmt);
    searchCommand.setInput(inputParts);
    searchCommand.queries = queries;

    return searchCommand;
  }

  async processSearchQuery(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
  ): Promise<SearchCommand> {
    let searchCommand = new SearchCommand(options);
    searchCommand = await this.parseSearchQuery(searchCommand);

    if (!searchCommand.statement) {
      throw new PublicError(
        "Querying by archetype only is not implemented. Please specify a perk to narrow results"
      );
    }

    const weaponIds = await executeSearchQuery(
      this.weaponDBService.db,
      searchCommand.statement,
      searchCommand.queries
    );
    const results = await getInventoryItemsByHashes(this.dbService.db, weaponIds);
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

  private async narrowFuzzyQuery(type: PerkType, query: string | undefined) {
    if (!query) throw Error("Query for perk " + type + " is empty");
    const results = await getFuzzyQueryNames(this.weaponDBService.db, type, query);
    const bestResult = fuzzysort.go(query, results, {
      allowTypo: false,
    })[0];
    if (bestResult) return bestResult.target;
    else throw new PublicError("Could not narrow query: " + query);
  }

  private async narrowFuzzyQueryTraits(query: string | undefined) {
    if (!query) throw Error("Query for trait perks is empty");
    const results = await getFuzzyQueryNames(this.weaponDBService.db, "traits1", query);
    const results2 = await getFuzzyQueryNames(this.weaponDBService.db, "traits2", query);
    const bestResult = fuzzysort.go(query, results, {
      allowTypo: false,
    })[0];
    const bestResult2 = fuzzysort.go(query, results2, {
      allowTypo: false,
    })[0];
    if (bestResult || bestResult2) return bestResult?.target || bestResult2?.target;
    else throw new PublicError("Could not narrow query: " + query);
  }

  async createWeaponTables(weaponItems: DestinyInventoryItemDefinitionRecord[]) {
    _logger.warn("'Enhanced' is removed from perk names");
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
            if (stringIs<PerkType>(socketTypeName, WeaponTables))
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
    tableName: PerkType,
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
