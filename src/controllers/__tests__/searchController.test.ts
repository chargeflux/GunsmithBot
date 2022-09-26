import { ValidTraitsOptions } from "../../models/commands/searchCommand";
import WeaponDBService, { PerkType } from "../../services/weaponDbService";
import ManifestDBService from "../../services/manifestDbService";
import SearchController from "../searchController";

jest.mock("../../services/manifestDbService");
jest.mock("../../services/weaponDbService");

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
      " INTERSECT SELECT weaponHash FROM traits1 where name is ? INTERSECT SELECT weaponHash FROM traits2 where name is ? UNION SELECT weaponHash FROM (SELECT weaponHash FROM traits2 where name is ? INTERSECT SELECT weaponHash FROM traits1 where name is ?);",
  },
  {
    traitState: ValidTraitsOptions.Traits1,
    expected:
      " INTERSECT SELECT weaponHash FROM traits1 where name is ? UNION SELECT weaponHash FROM traits2 where name is ?;",
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
