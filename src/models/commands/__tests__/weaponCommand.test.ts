import { Weapon } from "../../destiny-entities/weapon";
import WeaponCommand, { WeaponCommandOptions } from "../weaponCommand";

describe("order", () => {
  test.each([
    {
      query: "IKELOS_SM",
      weapons: [
        {
          name: "IKELOS_SMG_v1.0.1",
          hasRandomRolls: false,
          archetype: {
            name: "IKELOS_SMG_v1.0.1",
            slot: "Energy",
            class: "Submachine Gun",
            rarity: "Legendary",
            damage: "Arc",
            isKinetic: false,
            powerCap: 1060,
          },
        },
        {
          name: "IKELOS_SMG_v1.0.3",
          hasRandomRolls: true,
          archetype: {
            name: "IKELOS_SMG_v1.0.3",
            slot: "Energy",
            class: "Submachine Gun",
            rarity: "Legendary",
            damage: "Arc",
            isKinetic: false,
            powercap: 0,
          },
        },
        {
          name: "IKELOS_SMG_v1.0.2",
          hasRandomRolls: true,
          archetype: {
            name: "IKELOS_SMG_v1.0.2",
            slot: "Energy",
            class: "Submachine Gun",
            rarity: "Legendary",
            damage: "Arc",
            isKinetic: false,
            powercap: 0,
          },
        },
      ],
      expected: [1, 2, 0],
    },
    {
      query: "Thorn",
      weapons: [
        {
          name: "Hawthorne's Field-Forged Shotgun",
          hasRandomRolls: false,
          seasonNumber: 1,
          archetype: {
            name: "Hawthorne's Field-Forged Shotgun",
            slot: "Kinetic",
            class: "Shotgun",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1060,
          },
        },
        {
          name: "Hawthorne's Field-Forged Shotgun",
          hasRandomRolls: true,
          seasonNumber: 9,
          archetype: {
            name: "Hawthorne's Field-Forged Shotgun",
            slot: "Kinetic",
            class: "Shotgun",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1260,
          },
        },
        {
          name: "Thorn",
          hasRandomRolls: false,
          seasonNumber: 6,
          archetype: {
            name: "Thorn",
            slot: "Kinetic",
            class: "Hand Cannon",
            rarity: "Exotic",
            damage: "Kinetic",
            isKinetic: true,
            powercap: 0,
          },
        },
      ],
      expected: [2, 1, 0],
    },
    {
      query: "Hawthorne",
      weapons: [
        {
          name: "Hawthorne's Field-Forged Shotgun",
          hasRandomRolls: false,
          seasonNumber: 1,
          archetype: {
            name: "Hawthorne's Field-Forged Shotgun",
            slot: "Kinetic",
            class: "Shotgun",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1060,
          },
        },
        {
          name: "Hawthorne's Field-Forged Shotgun",
          hasRandomRolls: true,
          seasonNumber: 9,
          archetype: {
            name: "Hawthorne's Field-Forged Shotgun",
            slot: "Kinetic",
            class: "Shotgun",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1260,
          },
        },
      ],
      expected: [1, 0],
    },
    {
      query: "Nameless Midnight",
      weapons: [
        {
          name: "Nameless Midnight",
          hasRandomRolls: true,
          seasonNumber: 20,
          archetype: {
            name: "Nameless Midnight",
            slot: "Kinetic",
            class: "Scout Rifle",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 0,
          },
        },
        {
          name: "Nameless Midnight",
          hasRandomRolls: false,
          seasonNumber: 1,
          archetype: {
            name: "Nameless Midnight",
            slot: "Kinetic",
            class: "Scout Rifle",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1060,
          },
        },
        {
          name: "Nameless Midnight",
          hasRandomRolls: true,
          seasonNumber: 4,
          archetype: {
            name: "Nameless Midnight",
            slot: "Kinetic",
            class: "Scout Rifle",
            rarity: "Legendary",
            damage: "Kinetic",
            isKinetic: true,
            powerCap: 1060,
          },
        },
      ],
      expected: [0, 2, 1],
    },
  ])("order results - $query", ({ query, weapons, expected }) => {
    const command = new WeaponCommand(query, new WeaponCommandOptions(), [
      ...(weapons as unknown as Weapon[]),
    ]);
    for (let index = 0; index < command.results.length; index++) {
      const element = command.results[index];
      expect(element).toBe(weapons[expected[index]]);
    }
  });
});
