import Discord from "discord.js";
import cron from "croner";
import ModController from "../controllers/modController";
import PerkController from "../controllers/perkController";
import SearchController from "../controllers/searchController";
import WeaponController from "../controllers/weaponController";
import ManifestDBService from "../services/manifestDbService";
import { getInventoryItemsWeapons } from "../services/dbQuery/inventoryItem";
import { getCurrentVersion, updateManifest } from "../services/manifestService";
import WeaponDBService from "../services/weaponDbService";
import deployCommands from "./deployCommand";
import { logger } from "../logger";
import ArmorController from "../controllers/armorController";
import { initializeCache } from "../utils/utils";

const _logger = logger.getSubLogger({ name: "BaseClient" });

export default class BaseClient {
  client: Discord.Client;
  perkController!: PerkController;
  weaponController!: WeaponController;
  modController!: ModController;
  armorController!: ArmorController;
  searchController!: SearchController;

  constructor() {
    this.client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages],
    });
    this.init();
  }

  public init() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
    this.client.once("ready", async () => {
      await this.initializeControllers();
      if (process.env.AUTOMATIC_MANIFEST_UPDATE == "true") {
        this.startCronSchedules();
      }
      await initializeCache();
      _logger.info("Ready!");
    });

    this.client.on("messageCreate", async (message) => {
      if (
        message.content.toLowerCase() === "!deploy" &&
        process.env.APPLICATION_AUTHOR_ID == message.author.id
      )
        try {
          deployCommands();
          await message.reply("Deployed commands");
        } catch (e) {
          _logger.error("Failed to deploy commands", e);
          await message.reply("Failed to deploy commands");
        }
    });
  }

  async initializeControllers() {
    const dbService = new ManifestDBService();
    const weaponDBService = new WeaponDBService();
    try {
      await updateManifest(dbService).then(async (version: string) => {
        if (version != weaponDBService.getVersion()) {
          _logger.info("Reinitializing Weapon DB");
          const weaponItems = await getInventoryItemsWeapons(dbService.db);
          const { perkDBTables, archetypes } = await new SearchController().createWeaponTables(
            weaponItems
          );
          try {
            weaponDBService.construct(perkDBTables, archetypes);
            weaponDBService.setVersion(version);
          } catch (e) {
            _logger.fatal("Failed to construct WeaponDB. Shutting down.", e);
            this.client.destroy();
            process.exit();
          }
        }
      });
    } catch (e) {
      _logger.error("Failed to check or update manifest", e);
      if (!(await getCurrentVersion())) {
        _logger.fatal("Failed to retrieve manifest data. Shutting down.");
        this.client.destroy();
        process.exit();
      }
    }
    this.perkController = new PerkController();
    this.weaponController = new WeaponController();
    this.modController = new ModController();
    this.armorController = new ArmorController();
    this.searchController = new SearchController();
  }

  public tearDown() {
    this.perkController?.dbService.close();
    this.weaponController?.dbService.close();
    this.modController?.dbService.close();
    this.searchController?.dbService.close();
    this.searchController?.weaponDBService.close();
  }

  startCronSchedules() {
    cron(
      "5 9 * * *",
      {
        timezone: "America/Los_Angeles",
      },
      async () => {
        _logger.info("Running update");
        this.tearDown();
        await this.initializeControllers();
      }
    );
  }
}
