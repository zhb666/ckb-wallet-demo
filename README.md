# ckb-wallet-demo

## Technology stack

- JavaScript
- React + Rewired + TypeScript + AntDesign

## Install, run, build, format code

- `npm i --force or cnpm i`
- `npm run start`
- `npm run e2e`
- `npm run test`
- `npm build`

### Prerequisites

- [Node.js 14+](https://nodejs.org/en/)

### light-client RPC

The wallet of this project depends on the light node. It is recommended to start ckb-light-client according to the tutorial first, with a link

- [github](https://github.com/nervosnetwork/ckb-light-client)

<!-- ### Create wallet mnemonics and private keys on the home page -->

### Install Dependencies

```sh
npm i --force
```

You will also need to delete the following file due to a problem in the NPM package.
The hookrouter is missing files and needs to be deleted manually
There are several versions of buffer. Version 4.9.2 is obsolete and needs to be deleted manually

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

- [x] Create imported wallet
- [x] An error will be reported in the main network transfer
- [x] Integrated test environment
- [x] Integrated e2e cypress environment
- [x] Nervos Dao
