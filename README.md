# ckb-wallet-demo

## Developing

## Technology stack

- JavaScript
- React + Rewired + TypeScript + AntDesign

## Install, run, build, format code

- `npm i`
- `npm run start`
- `npm run e2e`
- `npm run test`
- `npm build`
- `npm format`

### Prerequisites

- [Node.js 14+](https://nodejs.org/en/)

### light-client RPC

- [githup](https://github.com/yangby-cryptape/ckb-light-client/tree/develop#how-to-connect-testnet)

### Create wallet mnemonics and private keys on the home page

### transfer

- uses @nervosnetwork/ckb-lumos transfer

### Install Dependencies

```sh
npm i --force
```

You will also need to delete the following file due to a problem in the NPM package.

```sh
rm -f node_modules/hookrouter/dist/index.d.ts
rm -rf node_modules/_buffer@4.9.2@buffer
```

### Start the Development Server

```sh
npm start
```

### Building

```sh
npm run build
```

### Deploying

Build the project, then copy the complete contents of the `build` directory to the document root of the web server.

## Plans

- [x] An error will be reported in the main network transfer
- [x] Integrated test environment
- [x] Integrated e2e cypress environment
- [x] Nervos Dao
