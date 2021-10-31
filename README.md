# GunsmithBot

Discord bot to retrieve weapon rolls for Destiny 2

## Setup

```bash
cp .env.sample .env
```

Fill out the `.env` file with the appropriate values.

Depending on the value of `NUM_GUILDS`, add entries of `GUILD_ID_n` where n is incremented until `NUM_GUILDS` starting from 1. For example, if `NUM_GUILDS` = 2, then there should be an entry in `.env` for `GUILD_ID_1` and for `GUILD_ID_2`, each containing the id of 2 different Discord servers. This bot was designed to be used in a few servers but this limit can be removed.

## Installation

Node.js v16 is recommended.

```bash
npm install
```

## Usage

```bash
npm start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Resources/Attributions

[Destiny 2 API Info - vpzed](https://github.com/vpzed/Destiny2-API-Info/wiki/)

- An excellent guide to understanding Bungie's API

[Bungie.net API](https://bungie-net.github.io/multi/index.html)

## License

[MIT](./LICENSE)
