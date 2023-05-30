import PerkOptions from "../../models/command-options/perkOptions";
import ManifestDBService from "../../services/manifestDbService";
import PerkController from "../perkController";

const maybe = process.env.TEST_INTEGRATION === "true" ? describe : describe.skip;

maybe("search perks", () => {
  test.each([
    { query: "Rampage", category: "Traits" },
    { query: "Jagged Edge", category: "Blades" },
    { query: "Golden Tricorn", category: "Traits" },
    { query: "Vanishing Shadow", category: "Intrinsics" },
    { query: "Conduction Tines", category: "Intrinsics" },
  ])("process valid perk - $query, $category", async ({ query, category }) => {
    const perkController = new PerkController(new ManifestDBService());
    const options = new PerkOptions(false);
    const perkCommand = await perkController.processQuery(query, options);
    expect(perkCommand).not.toBe(undefined);
    expect(perkCommand?.count).toBeGreaterThan(0);
    const firstResult = perkCommand?.results[0];
    expect(firstResult?.name).toBe(query);
    expect(firstResult?.category).toBe(category);
    expect(firstResult?.currentlyCanRoll).toBe(true);
    expect(firstResult?.isEnhanced).toBe(false);
  });

  test.each([
    { query: "Suppressive Darkness" },
    { query: "Whisper of Hedrons" },
    { query: "Passive Guard" },
    { query: "Icarus Grip" },
  ])("process invalid perks - $query", async ({ query }) => {
    const perkController = new PerkController(new ManifestDBService());
    const options = new PerkOptions(false);
    const perkCommand = await perkController.processQuery(query, options);
    expect(perkCommand).not.toBe(undefined);
    expect(perkCommand?.count).toBe(0);
  });

  test.each([
    { query: "Perpetual Motion", category: "Traits" },
    { query: "Field Prep", category: "Traits" },
    { query: "Frenzy", category: "Traits" },
  ])("process valid enhanced perk - $query, $category", async ({ query, category }) => {
    const perkController = new PerkController(new ManifestDBService());
    const options = new PerkOptions(true);
    const perkCommand = await perkController.processQuery(query, options);
    expect(perkCommand).not.toBe(undefined);
    expect(perkCommand?.count).toBeGreaterThan(0);
    const firstResult = perkCommand?.results[0];
    expect(firstResult?.name).toBe(query);
    expect(firstResult?.category).toBe(category);
    expect(firstResult?.currentlyCanRoll).toBe(true);
    expect(firstResult?.isEnhanced).toBe(true);
  });
});
