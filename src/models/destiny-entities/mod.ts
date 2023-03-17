import {
  DestinyInventoryItemDefinition,
  DestinySandboxPerkDefinition,
} from "bungie-api-ts/destiny2";
import { BaseMetadata } from "./baseMetadata";
import { BUNGIE_URL_ROOT, EnergyType } from "../constants";

export default class Mod implements BaseMetadata {
  name: string;
  source = "";
  icon: string;
  hash: number;
  itemTypeDisplayName: string;
  energyCost?: number;
  energyType?: keyof typeof EnergyType;
  sections: Map<string, string[]> = new Map<string, string[]>();

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
        throw Error("Energy Type not known: " + rawModData.plug.energyCost.energyType);
      this.energyType = energyType as keyof typeof EnergyType;
    }
    this.hash = rawModData.hash;
    this.parseDescription(sandboxPerks);
    if (this.sections.size == 0 && rawModData.displayProperties.description != "")
      this.sections.set(this.name, [rawModData.displayProperties.description]);
    if (this.source) this.source += "\n" + source.replace("Source: ", "");
    else this.source += source.replace("Source: ", "");
  }

  parseDescription(sandboxPerks: DestinySandboxPerkDefinition[]) {
    for (const perk of sandboxPerks) {
      if (perk.displayProperties.description) {
        if (perk.displayProperties.name == "UNLOCKED BY QUEST") {
          this.source = perk.displayProperties.description;
          continue;
        }
        let description = perk.displayProperties.description;
        if (
          this.itemTypeDisplayName.includes("Stasis") ||
          this.itemTypeDisplayName.includes("Strand")
        )
          // addresses "[Stasis] Stasis"
          // addresses "[Strand] Strand"
          description = description.replace(/ \[.*?\]/, "");
        const values = this.sections.get(perk.displayProperties.name) ?? [];
        values?.push(description);
        this.sections.set(perk.displayProperties.name, values);
      }
    }
  }

  get overview() {
    let overview = "";
    if (this.energyCost) {
      if (this.energyType && this.energyType != "Any")
        overview = `${this.energyCost} ${this.energyType} Energy`;
      else overview = `${this.energyCost} Energy`;
      if (this.itemTypeDisplayName) overview += ` - ${this.itemTypeDisplayName}`;
    }
    if (overview == "") return this.itemTypeDisplayName;
    return overview;
  }

  getSortedSectionKeys() {
    const sections = [...this.sections];
    const sortedSectionKeys: string[] = [];
    for (const section of sections) {
      if (section[0] == this.name) {
        sortedSectionKeys.splice(0, 0, section[0]);
      } else if (section[0] == "Stat Penalty") {
        sortedSectionKeys.splice(1, 0, section[0]);
      } else sortedSectionKeys.push(section[0]);
    }
    return sortedSectionKeys;
  }

  toString() {
    return this.name;
  }
}
