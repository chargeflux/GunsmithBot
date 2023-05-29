import WeaponController from "../weaponController";
import ManifestDBService from "../../services/manifestDbService";
import WeaponOptions from "../../models/command-options/weaponOptions";

const maybe = process.env.TEST_INTEGRATION === "true" ? describe : describe.skip;

maybe("search weapons", () => {
  test.each([
    {
      query: "Wendigo GL3",
      adept: true,
    },
    {
      query: "Thorn",
      adept: false,
    },
  ])("query only adept - $query", async ({ query, adept }) => {
    const weaponController = new WeaponController(new ManifestDBService());
    const command = await weaponController.processWeaponQuery(
      query,
      new WeaponOptions(false, false, false, adept)
    );
    const notCommand = await weaponController.processWeaponQuery(
      query,
      new WeaponOptions(false, false, false, !adept)
    );

    expect(command?.results.length).not.toBe(notCommand?.results.length ?? 0);
  });
});
