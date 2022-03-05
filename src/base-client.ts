import Discord from "discord.js";
import cron from "node-cron";
import ModController from "./controllers/mod-controller";
import PerkController from "./controllers/perk-controller";
import SearchController from "./controllers/search-controller";
import WeaponController from "./controllers/weapon-controller";
import ManifestDBService from "./services/manifest-db-service";
import { getInventoryItemsWeapons } from "./services/manifest/inventory-item-service";
import { getCurrentVersion, updateManifest } from "./services/manifest/manifest-service";
import WeaponDBService from "./services/weapon-db-service";
import deployCommands from "./services/deploy-command-service";
import { logger } from "./services/logger-service";
import ArmorController from "./controllers/armor-controller";

const _logger = logger.getChildLogger({ name: "BaseClient" });

export default class BaseClient {
  client: Discord.Client;
  perkController!: PerkController;
  weaponController!: WeaponController;
  modController!: ModController;
  armorController!: ArmorController;
  searchController!: SearchController;

  constructor() {
    this.client = new Discord.Client({
      intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
    });
    this.init();
  }

  public init() {
    this.client.login(process.env.DISCORD_BOT_TOKEN);
    this.client.once("ready", async () => {
      await this.initializeControllers();
      this.startCronSchedules();
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
    try {
      await updateManifest(dbService).then(async (toChange: boolean) => {
        if (toChange) {
          const weaponItems = await getInventoryItemsWeapons(dbService.db);
          const tables = await new SearchController().createWeaponTables(weaponItems);
          try {
            new WeaponDBService().construct(tables);
          } catch (e) {
            _logger.fatal("Failed to construct WeaponDB. Shutting down.");
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
    cron.schedule(
      "5 9 * * *",
      async () => {
        _logger.info("Running update");
        this.tearDown();
        await this.initializeControllers();
      },
      {
        timezone: "America/Los_Angeles",
      }
    );
  }
}
