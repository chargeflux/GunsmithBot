import {
  DestinyInventoryItemDefinition,
  DestinySandboxPerkDefinition,
} from "bungie-api-ts/destiny2";
import { BaseMetadata } from "../commands/base-metadata";
import { BUNGIE_URL_ROOT, EnergyType, ModCategory } from "../constants";

export default class Mod implements BaseMetadata {
  name: string;
  description: string = "";
  source: string = "";
  icon: string;
  hash: number;
  category: keyof typeof ModCategory;
  energyCost?: number;
  energyType?: keyof typeof EnergyType;
  armorLocation?: string;
  perkHashes: number[];
  collectibleHash?: number;

  constructor(
    rawModData: DestinyInventoryItemDefinition,
    category: keyof typeof ModCategory,
    armorLocation?: keyof typeof ModCategory
  ) {
    this.name = rawModData.displayProperties.name;
    this.icon = BUNGIE_URL_ROOT + rawModData.displayProperties.icon;
    this.category = category;
    this.energyCost = rawModData.plug?.energyCost?.energyCost;
    if (rawModData.plug?.energyCost) {
      let energyType = EnergyType[rawModData.plug.energyCost.energyType];
      if (!energyType)
        throw Error(
          "Energy Type not known: " + rawModData.plug.energyCost.energyType
        );
      this.energyType = energyType as keyof typeof EnergyType;
    }
    this.hash = rawModData.hash;

    this.armorLocation = armorLocation;
    this.perkHashes = rawModData.perks.map((x) => x.perkHash);
    if (this.perkHashes.length == 0) throw Error("Not a mod: " + this.name);
    this.collectibleHash = rawModData.collectibleHash;
  }

  setDescription(sandboxPerks: DestinySandboxPerkDefinition[]) {
    let description = sandboxPerks
      .map((x) => x.displayProperties.description)
      .filter((x) => (x ? true : false))
      .join("\n• ");
    if (
      this.category == ModCategory[ModCategory.Aspect] ||
      this.category == ModCategory[ModCategory.Fragment]
    )
      // address "[Stasis] Stasis"
      this.description = description.replace(/\ \[.*?\]/, "");
    else this.description = description;
  }

  setSource(source: string) {
    this.source = source;
  }

  get overview() {
    let overview = "";
    if (this.energyCost) {
      if (this.energyType && this.energyType != "Any")
        overview = `${this.energyCost} ${this.energyType} Energy`;
      else overview = `${this.energyCost} Energy`;
      if (this.armorLocation) overview += ` - ${this.armorLocation}`;
    }
    return overview ?? (this.category.startsWith("Weapon") ? "Weapon" : "Armor");
  }

  toString() {
    return this.name;
  }
}
