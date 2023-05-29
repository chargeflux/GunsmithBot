# GunsmithBot

Discord bot to retrieve weapon rolls for Destiny 2

## Setup

```bash
cp .env.sample .env
```

Fill out the `.env` file with the appropriate values.

## Installation

Node.js v16.17.0 is recommended.

```bash
npm install
```

## Usage

```bash
npm start
```

To deploy slash commands

```bash
npm run deployCommands
```

To run tests

```bash
npm run test
```

To run integration tests

```bash
cp .env.testing.sample .env.testing
```

Enable integration testing environment variables as needed and the bot should be run at least once or run the database creation test first to instantiate the database.

```bash
npm run test
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
