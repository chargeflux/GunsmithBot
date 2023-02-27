export const DISCORD_BG_HEX = 0x2f3136;

export const BUNGIE_URL_ROOT = "https://www.bungie.net";

export enum QueryType {
  "Perk" = "perk",
  "Weapon" = "weapon",
  "Armor" = "armor",
  "Mod" = "mod",
  "Compare" = "compare",
  "Search" = "search",
}

export enum PlugCategory {
  // socketCategoryHash=4241085061 (WEAPON_PERKS) in DestinySocketTypeDefinition or DestinyInventoryItemDefinition.plug.plugCategoryHash
  "Intrinsics" = 1744546145,
  "Stocks" = 577918720,
  "Frames" = 7906839,
  "Traits" = 7906839, // Overrides Previous Category Name
  "Barrels" = 2833605196,
  "Bowstrings" = 3809303875,
  "Magazines" = 1806783418,
  "Magazines_GL" = 2718120384,
  "Projectiles" = 2718120384,
  "Blades" = 1041766312,
  "Grips" = 3962145884,
  "Batteries" = 1757026848,
  "Guards" = 683359327,
  "Scopes" = 2619833294,
  "Arrows" = 1257608559,
  "Tubes" = 1202604782,
  "Launchers" = 1202604782,
  "Origin Traits" = 164955586,
  "Default" = -1, // User Defined
}

export const WEAPON_CATEGORY_HASH = 1;

export enum WeaponSlot {
  "Kinetic" = 2,
  "Energy" = 3,
  "Power" = 4,
}

export enum WeaponClass {
  // DestinyItemCategoryDefinition or DestinyInventoryItemDefinition.itemCategoryHashes
  "Auto Rifle" = 5,
  "Hand Cannon" = 6,
  "Pulse Rifle" = 7,
  "Scout Rifle" = 8,
  "Fusion Rifle" = 9,
  "Sniper Rifle" = 10,
  "Shotgun" = 11,
  "Machine Gun" = 12,
  "Rocket Launcher" = 13,
  "Sidearm" = 14,
  "Sword" = 54,
  "Grenade Launcher" = 153950757,
  "Linear Fusion Rifle" = 1504945536,
  "Trace Rifle" = 2489664120,
  "Bow" = 3317538576,
  "Submachine Gun" = 3954685534,
  "Glaive" = 3871742104,
  "Dummy" = 3109687656,
}

export enum TierType {
  // DestinyItemTierTypeDefinition or DestinyInventoryItemDefinition.inventory.tierTypeHash
  "Basic" = 3340296461,
  "Common" = 2395677314,
  "Rare" = 2127292149,
  "Legendary" = 4008398120,
  "Exotic" = 2759499571,
}

export enum DamageType {
  // DestinyDamageTypeDefinition or DestinyInventoryItemDefinition.[damageTypes, damageTypeHashes]
  "Kinetic" = 1,
  "Arc" = 2,
  "Solar" = 3,
  "Void" = 4,
  "Raid" = 5,
  "Stasis" = 6,
  "Strand" = 7,
}

export enum WeaponStat {
  "Accuracy" = 1591432999,
  "Aim Assistance" = 1345609583,
  "Ammo Capacity" = 925767036,
  "Blast Radius" = 3614673599,
  "Charge Rate" = 3022301683,
  "Charge Time" = 2961396640,
  "Draw Time" = 447667954,
  "Guard Efficiency" = 2762071195,
  "Guard Endurance" = 3736848092,
  "Guard Resistance" = 209426660,
  "Handling" = 943549884,
  "Impact" = 4043523819,
  "Magazine" = 3871231066,
  "Range" = 1240592695,
  "Recoil" = 2715839340,
  "Reload Speed" = 4188031367,
  "RPM" = 4284893193,
  "Stability" = 155624089,
  "Swing Speed" = 2837207746,
  "Velocity" = 2523465841,
  "Zoom" = 3555269338,
}

export enum StatOrder {
  "Impact" = 0,
  "Accuracy" = 1,
  "Range" = 2,
  "Blast Radius" = 3,
  "Velocity" = 4,
  "Stability" = 5,
  "Handling" = 6,
  "Reload Speed" = 7,
  "Swing Speed" = 8,
  "Charge Rate" = 9,
  "Guard Resistance" = 10,
  "Guard Efficiency" = 11,
  "Guard Endurance" = 12,
  "Aim Assistance" = 13,
  "Zoom" = 14,
  "Recoil" = 15,
  "RPM" = 16,
  "Charge Time" = 17,
  "Draw Time" = 18,
  "Ammo Capacity" = 19,
  "Magazine" = 20,
}

export enum SocketCategoryHash {
  "Intrinsics" = 3956125808,
  "WeaponPerks" = 4241085061,
  "ArmorPerks" = 3154740035,
}

export enum ModCategory {
  "Mods" = 59,
  "Armor" = 4104513227,
  "WeaponDamage" = 1052191496,
  "Aspect" = 962416439,
  "Fragment" = 1635887355,
  "Bonus Mods" = 303512563,
}

export enum EnergyType {
  "Any" = 0,
  "Arc" = 1,
  "Solar" = 2,
  "Void" = 3,
  "Ghost" = 4,
  "Subclass" = 5,
  "Stasis" = 6,
}

export enum GuardianClass {
  "Warlock" = 21,
  "Titan" = 22,
  "Hunter" = 23,
}

export enum ArmorType {
  "Armor" = 20,
  "Helmet" = 45,
  "Arms" = 46,
  "Chest" = 47,
  "Legs" = 48,
  "Class Item" = 49,
}

export const MAX_POWER_LEVEL = 999990;

// Credit to https://github.com/DestinyItemManager/d2-additional-info/blob/master/output/watermark-to-season.json

export const WATERMARK_TO_SEASON_NUMBER: { [key: string]: number } = {
  "/common/destiny2_content/icons/0dac2f181f0245cfc64494eccb7db9f7.png": 1,
  "/common/destiny2_content/icons/dd71a9a48c4303fd8546433d63e46cc7.png": 1,
  "/common/destiny2_content/icons/591f14483308beaad3278c3cd397e284.png": 2,
  "/common/destiny2_content/icons/50d36366595897d49b5d33e101c8fd07.png": 2,
  "/common/destiny2_content/icons/e10338777d1d8633e073846e613a1c1f.png": 3,
  "/common/destiny2_content/icons/aaa61f6c70478d87de0df41e5709a773.png": 3,
  "/common/destiny2_content/icons/0669efb55951e8bc9e99f3989eacc861.png": 4,
  "/common/destiny2_content/icons/02478e165d7d8d2a9f39c2796e7aac12.png": 4,
  "/common/destiny2_content/icons/bbddbe06ab72b61e708afc4fdbe15d95.png": 5,
  "/common/destiny2_content/icons/c23c9ec8709fecad87c26b64f5b2b9f5.png": 5,
  "/common/destiny2_content/icons/f9110e633634d112cff72a67159e3b12.png": 6,
  "/common/destiny2_content/icons/e4a1a5aaeb9f65cc5276fd4d86499c70.png": 6,
  "/common/destiny2_content/icons/785e5a64153cabd5637d68dcccb7fea6.png": 7,
  "/common/destiny2_content/icons/69bb11f24279c7a270c6fac3317005b2.png": 7,
  "/common/destiny2_content/icons/8aae1c411642683d341b2c4f16a7130c.png": 8,
  "/common/destiny2_content/icons/ee3f5bb387298acbdb03c01940701e63.png": 8,
  "/common/destiny2_content/icons/d4141b2247cf999c73d3dc409f9d00f7.png": 8,
  "/common/destiny2_content/icons/82a8d6f2b1e4ee14e853d4ffbe031406.png": 8,
  "/common/destiny2_content/icons/ac012e11fa8bb032b923ad85e2ffb29c.png": 9,
  "/common/destiny2_content/icons/9b7e4bbc576fd15fbf44dfa259f8b86a.png": 9,
  "/common/destiny2_content/icons/3d335ddc3ec6668469aae60baad8548d.png": 10,
  "/common/destiny2_content/icons/e27a4f39c1bb8c6f89613648afaa3e9f.png": 10,
  "/common/destiny2_content/icons/796813aa6cf8afe55aed4efc2f9c609b.png": 11,
  "/common/destiny2_content/icons/49dc693c5f3411b9638b97f38a70b69f.png": 11,
  "/common/destiny2_content/icons/0aff1f4463f6f44e9863370ab1ce6983.png": 12,
  "/common/destiny2_content/icons/1f702463c5e0c4e25c9f00a730dbc6ac.png": 12,
  "/common/destiny2_content/icons/2347cc2407b51e1debbac020bfcd0224.png": 12,
  "/common/destiny2_content/icons/d3cffdcb881085bc4fe19d9671c9eb0c.png": 12,
  "/common/destiny2_content/icons/4b6352a0fa6f68cd2b8ce5c3ba18747c.png": 12,
  "/common/destiny2_content/icons/6a52f7cd9099990157c739a8260babea.png": 13,
  "/common/destiny2_content/icons/e197b731c11556b17664b90a87dd0c11.png": 13,
  "/common/destiny2_content/icons/b07d89064a1fc9a8e061f59b7c747fa5.png": 14,
  "/common/destiny2_content/icons/a9faab035e2f59f802e99641a3aaab9e.png": 14,
  "/common/destiny2_content/icons/4368a3e344977c5551407845ede830c2.png": 15,
  "/common/destiny2_content/icons/dd4dd93c5606998595d9e5a06d5bfc9c.png": 15,
  "/common/destiny2_content/icons/4fe83598190610f122497d22579a1fd9.png": 16,
  "/common/destiny2_content/icons/d05833668bcb5ae25344dd4538b1e0b2.png": 16,
  "/common/destiny2_content/icons/b0406992c49c84bdc5febad94048dc01.png": 16,
  "/common/destiny2_content/icons/81edbfbf0bacf8e2117c00d1d6115f1b.png": 17,
  "/common/destiny2_content/icons/f359d68324ae21522c299983ff1ef9f2.png": 18,
  "/common/destiny2_content/icons/1a68ada4fb21371c5f2b7e2eae1ebce8.png": 19,
};
