export type PartialDestinyManifest = {
  Response: PartialManifestData;
};

type PartialManifestData = {
  jsonWorldComponentContentPaths: PartialLanguageManifest;
  version: string;
};

type PartialLanguageManifest = {
  en: ManifestPayloadPaths;
};

interface ManifestPayloadPaths {
  [index: string]: string;
  DestinyAchievementDefinition: string;
  DestinyActivityDefinition: string;
  DestinyActivityGraphDefinition: string;
  DestinyActivityInteractableDefinition: string;
  DestinyActivityModeDefinition: string;
  DestinyActivityModifierDefinition: string;
  DestinyActivityTypeDefinition: string;
  DestinyArtDyeChannelDefinition: string;
  DestinyArtDyeReferenceDefinition: string;
  DestinyArtifactDefinition: string;
  DestinyBondDefinition: string;
  DestinyBreakerTypeDefinition: string;
  DestinyCharacterCustomizationCategoryDefinition: string;
  DestinyCharacterCustomizationOptionDefinition: string;
  DestinyChecklistDefinition: string;
  DestinyClassDefinition: string;
  DestinyCollectibleDefinition: string;
  DestinyDamageTypeDefinition: string;
  DestinyDestinationDefinition: string;
  DestinyEnergyTypeDefinition: string;
  DestinyEntitlementOfferDefinition: string;
  DestinyEquipmentSlotDefinition: string;
  DestinyFactionDefinition: string;
  DestinyGenderDefinition: string;
  DestinyInventoryBucketDefinition: string;
  DestinyInventoryItemDefinition: string;
  DestinyInventoryItemLiteDefinition: string;
  DestinyItemCategoryDefinition: string;
  DestinyItemTierTypeDefinition: string;
  DestinyLocationDefinition: string;
  DestinyLoreDefinition: string;
  DestinyMaterialRequirementSetDefinition: string;
  DestinyMedalTierDefinition: string;
  DestinyMetricDefinition: string;
  DestinyMilestoneDefinition: string;
  DestinyNodeStepSummaryDefinition: string;
  DestinyObjectiveDefinition: string;
  DestinyPlaceDefinition: string;
  DestinyPlatformBucketMappingDefinition: string;
  DestinyPlugSetDefinition: string;
  DestinyPowerCapDefinition: string;
  DestinyPresentationNodeDefinition: string;
  DestinyProgressionDefinition: string;
  DestinyProgressionLevelRequirementDefinition: string;
  DestinyProgressionMappingDefinition: string;
  DestinyRaceDefinition: string;
  DestinyRecordDefinition: string;
  DestinyReportReasonCategoryDefinition: string;
  DestinyRewardAdjusterPointerDefinition: string;
  DestinyRewardAdjusterProgressionMapDefinition: string;
  DestinyRewardItemListDefinition: string;
  DestinyRewardMappingDefinition: string;
  DestinyRewardSheetDefinition: string;
  DestinyRewardSourceDefinition: string;
  DestinySackRewardItemListDefinition: string;
  DestinySandboxPatternDefinition: string;
  DestinySandboxPerkDefinition: string;
  DestinySeasonDefinition: string;
  DestinySeasonPassDefinition: string;
  DestinySocketCategoryDefinition: string;
  DestinySocketTypeDefinition: string;
  DestinyStatDefinition: string;
  DestinyStatGroupDefinition: string;
  DestinyTalentGridDefinition: string;
  DestinyTraitCategoryDefinition: string;
  DestinyTraitDefinition: string;
  DestinyUnlockCountMappingDefinition: string;
  DestinyUnlockDefinition: string;
  DestinyUnlockEventDefinition: string;
  DestinyUnlockExpressionMappingDefinition: string;
  DestinyUnlockValueDefinition: string;
  DestinyVendorDefinition: string;
  DestinyVendorGroupDefinition: string;
}

export class ManifestTable {
  name: string;
  data: string[];

  constructor(name: string, data: ManifestTableData) {
    this.name = name;
    this.data = this.convertToArray(data);
  }

  convertToArray(data: ManifestTableData): string[] {
    var manifestData: string[] = [];
    for (var k in data) {
      manifestData.push(data[k]);
    }
    return manifestData;
  }
}

export type ManifestTableData = {
  [index: string]: string; // technically the value is a JSON object
};
