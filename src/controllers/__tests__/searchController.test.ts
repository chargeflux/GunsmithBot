import { ValidTraitsOptions } from "../../models/commands/searchCommand";
import WeaponDBService, { PerkType } from "../../services/weaponDbService";
import ManifestDBService from "../../services/manifestDbService";
import SearchController from "../searchController";
import { ArchetypeToSearch } from "../../models/commands/searchCommand";

const maybe = process.env.TEST_INTEGRATION === "true" ? describe : describe.skip;

maybe("build search query", () => {
  test.each([
    {
      sockets: ["arrows", "barrels"],
      expected:
        "SELECT weaponHash FROM arrows WHERE name is ? INTERSECT SELECT weaponHash FROM barrels WHERE name is ?",
    },
    {
      sockets: ["arrows", "barrels", "grips"],
      expected:
        "SELECT weaponHash FROM arrows WHERE name is ? INTERSECT SELECT weaponHash FROM barrels WHERE name is ? INTERSECT SELECT weaponHash FROM grips WHERE name is ?",
    },
    {
      sockets: ["arrows", "traits1"],
      expected: "SELECT weaponHash FROM arrows WHERE name is ?",
    },
    {
      sockets: [],
      expected: "",
    },
  ])("Build socket query", async ({ sockets, expected }) => {
    const searchController = new SearchController(new ManifestDBService(), new WeaponDBService());
    const stmt = searchController.buildQuerySockets(sockets as PerkType[]);
    expect(stmt).toBe(expected);
  });

  test.each([
    {
      traitState: ValidTraitsOptions.Traits1AndTraits2,
      expected:
        " INTERSECT SELECT weaponHash FROM traits1 where name is ? INTERSECT SELECT weaponHash FROM traits2 where name is ? UNION SELECT weaponHash FROM (SELECT weaponHash FROM traits2 where name is ? INTERSECT SELECT weaponHash FROM traits1 where name is ?)",
    },
    {
      traitState: ValidTraitsOptions.Traits1,
      expected:
        " INTERSECT SELECT weaponHash FROM traits1 where name is ? UNION SELECT weaponHash FROM traits2 where name is ?",
    },
    {
      traitState: ValidTraitsOptions.None,
      expected: "",
    },
  ])("Build trait query", async ({ traitState, expected }) => {
    const searchController = new SearchController(new ManifestDBService(), new WeaponDBService());
    const stmt = searchController.buildQueryTraits(traitState);
    expect(stmt).toBe(expected);
  });

  test.each([
    {
      archetype: {
        slot: "Power",
        class: "Sword",
        damage: "Arc",
        rarity: "Legendary",
      } as ArchetypeToSearch,
      expected:
        " INTERSECT SELECT weaponHash FROM archetypes WHERE slot=? AND class=? AND damage=? AND rarity=?",
    },
  ])("Build archetype query", async ({ archetype, expected }) => {
    const searchController = new SearchController(new ManifestDBService(), new WeaponDBService());
    const { archetypeStmt } = searchController.buildQueryArchetype(archetype);
    expect(archetypeStmt).toBe(expected);
  });
});
