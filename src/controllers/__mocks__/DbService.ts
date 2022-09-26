export const ManifestDbService = jest.mock("../../services/manifestDbService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    return {
      db: jest.fn(),
    };
  }),
}));

export const WeaponDbService = jest.mock("../../services/weaponDbService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    return {
      db: jest.fn(),
    };
  }),
}));
