import {
  DestinyInventoryItemDefinition,
  DestinySandboxPerkDefinition,
} from "bungie-api-ts/destiny2";
import { BaseMetadata } from "../commands/base-metadata";
import { BUNGIE_URL_ROOT, EnergyType } from "../constants";

export default class Mod implements BaseMetadata {
  name: string;
  description: string;
  source: string;
  icon: string;
  hash: number;
  itemTypeDisplayName: string;
  energyCost?: number;
  energyType?: keyof typeof EnergyType;

  constructor(
    rawModData: DestinyInventoryItemDefinition,
    sandboxPerks: DestinySandboxPerkDefinition[],
    source: string
  ) {
    this.name = rawModData.displayProperties.name;
    this.icon = BUNGIE_URL_ROOT + rawModData.displayProperties.icon;
    this.itemTypeDisplayName = rawModData.itemTypeDisplayName;
    this.energyCost = rawModData.plug?.energyCost?.energyCost;
    if (rawModData.plug?.energyCost) {
      const energyType = EnergyType[rawModData.plug.energyCost.energyType];
      if (!energyType)
        throw Error(
          "Energy Type not known: " + rawModData.plug.energyCost.energyType
        );
      this.energyType = energyType as keyof typeof EnergyType;
    }
    this.hash = rawModData.hash;

    this.description = this.parseDescription(sandboxPerks);
    if (
      this.description == "" &&
      rawModData.displayProperties.description != ""
    )
      this.description = rawModData.displayProperties.description;
    this.source = source;
  }

  parseDescription(sandboxPerks: DestinySandboxPerkDefinition[]) {
    const description = sandboxPerks
      .map((x) => x.displayProperties.description)
      .filter((x) => (x ? true : false))
      .join("\n• ");
    if (this.itemTypeDisplayName.includes("Stasis"))
      // address "[Stasis] Stasis"
      return description.replace(/ \[.*?\]/, "");
    else return description;
  }

  get overview() {
    let overview = "";
    if (this.energyCost) {
      if (this.energyType && this.energyType != "Any")
        overview = `${this.energyCost} ${this.energyType} Energy`;
      else overview = `${this.energyCost} Energy`;
      if (this.itemTypeDisplayName)
        overview += ` - ${this.itemTypeDisplayName}`;
    }
    if (overview == "") return this.itemTypeDisplayName;
    return overview;
  }

  toString() {
    return this.name;
  }
}
