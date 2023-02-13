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
