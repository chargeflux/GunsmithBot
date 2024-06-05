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
  "/common/destiny2_content/icons/dd71a9a48c4303fd8546433d63e46cc7.png": 1,
  "/common/destiny2_content/icons/fb50cd68a9850bd323872be4f6be115c.png": 1,
  "/common/destiny2_content/icons/2c024f088557ca6cceae1e8030c67169.png": 2,
  "/common/destiny2_content/icons/50d36366595897d49b5d33e101c8fd07.png": 2,
  "/common/destiny2_content/icons/ed6c4762c48bd132d538ced83c1699a6.png": 3,
  "/common/destiny2_content/icons/aaa61f6c70478d87de0df41e5709a773.png": 3,
  "/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png": 4,
  "/common/destiny2_content/icons/eb621df1be42ae5db9e8cd20eda17c44.png": 4,
  "/common/destiny2_content/icons/448f071a7637fcefb2fccf76902dcf7d.png": 5,
  "/common/destiny2_content/icons/c23c9ec8709fecad87c26b64f5b2b9f5.png": 5,
  "/common/destiny2_content/icons/1448dde4efdb57b07f5473f87c4fccd7.png": 6,
  "/common/destiny2_content/icons/e4a1a5aaeb9f65cc5276fd4d86499c70.png": 6,
  "/common/destiny2_content/icons/5364cc3900dc3615cb0c4b03c6221942.png": 7,
  "/common/destiny2_content/icons/69bb11f24279c7a270c6fac3317005b2.png": 7,
  "/common/destiny2_content/icons/2352f9d04dc842cfcdda77636335ded9.png": 8,
  "/common/destiny2_content/icons/ee3f5bb387298acbdb03c01940701e63.png": 8,
  "/common/destiny2_content/icons/e8fe681196baf74917fa3e6f125349b0.png": 8,
  "/common/destiny2_content/icons/82a8d6f2b1e4ee14e853d4ffbe031406.png": 8,
  "/common/destiny2_content/icons/3ba38a2b9538bde2b45ec9313681d617.png": 9,
  "/common/destiny2_content/icons/9b7e4bbc576fd15fbf44dfa259f8b86a.png": 9,
  "/common/destiny2_content/icons/b12630659223b53634e9f97c0a0a8305.png": 10,
  "/common/destiny2_content/icons/e27a4f39c1bb8c6f89613648afaa3e9f.png": 10,
  "/common/destiny2_content/icons/4c25426263cacf963777cd4988340838.png": 11,
  "/common/destiny2_content/icons/49dc693c5f3411b9638b97f38a70b69f.png": 11,
  "/common/destiny2_content/icons/9e0f43538efe9f8d04546b4b0af6cc43.png": 12,
  "/common/destiny2_content/icons/1f702463c5e0c4e25c9f00a730dbc6ac.png": 12,
  "/common/destiny2_content/icons/be3c0a95a8d1abc6e7c875d4294ba233.png": 12,
  "/common/destiny2_content/icons/d3cffdcb881085bc4fe19d9671c9eb0c.png": 12,
  "/common/destiny2_content/icons/0ec87dd7ef282db27e1fc337e9545cd0.png": 12,
  "/common/destiny2_content/icons/5ac4a1d48a5221993a41a5bb524eda1b.png": 13,
  "/common/destiny2_content/icons/e197b731c11556b17664b90a87dd0c11.png": 13,
  "/common/destiny2_content/icons/23968435c2095c0f8119d82ee222c672.png": 14,
  "/common/destiny2_content/icons/a9faab035e2f59f802e99641a3aaab9e.png": 14,
  "/common/destiny2_content/icons/671a19eca92ad9dcf39d4e9c92fcdf75.png": 15,
  "/common/destiny2_content/icons/d92e077d544925c4f37e564158f8f76a.png": 15,
  "/common/destiny2_content/icons/6e4fdb4800c34ccac313dd1598bd7589.png": 16,
  "/common/destiny2_content/icons/b973f89ecd631a3e3d294e98268f7134.png": 16,
  "/common/destiny2_content/icons/d05833668bcb5ae25344dd4538b1e0b2.png": 16,
  "/common/destiny2_content/icons/ab075a3679d69f40b8c2a319635d60a9.png": 17,
  "/common/destiny2_content/icons/a3923ae7d2376a1c4eb0f1f154da7565.png": 18,
  "/common/destiny2_content/icons/e775dcb3d47e3d54e0e24fbdb64b5763.png": 19,
  "/common/destiny2_content/icons/31445f1891ce9eb464ed1dcf28f43613.png": 20,
  "/common/destiny2_content/icons/af00bdcd3e3b89e6e85c1f63ebc0b4e4.png": 20,
  "/common/destiny2_content/icons/a568c77f423d1b49aeccbce0e7af79f6.png": 20,
  "/common/destiny2_content/icons/6026e9d64e8c2b19f302dafb0286897b.png": 21,
  "/common/destiny2_content/icons/3de52d90db7ee2feb086ef6665b736b6.png": 22,
  "/common/destiny2_content/icons/a2fb48090c8bc0e5785975fab9596ab5.png": 23,
  "/common/destiny2_content/icons/d5a3f4d7d20fefc781fea3c60bde9434.png": 23,
  "/common/destiny2_content/icons/0337ec21962f67c7c493fedb447c4a9b.png": 24,
  "/common/destiny2_content/icons/e3ea0bd2e889b605614276876667759c.png": 24,
};

export const EVENT_WATERMARK = [
  "/common/destiny2_content/icons/efdb35540cd169fa6e334995c2ce87b6.png",
  "/common/destiny2_content/icons/ad7fdb049d430c1fac1d20cf39059702.png",
  "/common/destiny2_content/icons/f80e39c767f309f0b2be625dae0e3744.png",
  "/common/destiny2_content/icons/52523b49e5965f6f33ab86710215c676.png",
  "/common/destiny2_content/icons/04de56db6d59127239ed51e82d16c06c.png",
];

export const UNKNOWN_SEASON_WATERMARK =
  "/common/destiny2_content/icons/3543d23d9063fbf7332c7f129a74ada2.png";

export const CRAFTED_ICON_URL =
  "https://www.bungie.net/img/destiny_content/border_items/crafted-icon-overlay-96x96.png";
