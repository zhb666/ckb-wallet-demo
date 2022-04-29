# ckb-wallet-demo

## Developing

### Prerequisites

- [Node.js 14+](https://nodejs.org/en/)

### Install Dependencies

### Create wallet mnemonics and private keys on the home page

### transfer-demo1

- uses @ckb-lumos transfer

### transfer-demo2

- uses @nervosnetwork/ckb-sdk-core transfer

```sh
npm i --force
```

You will also need to delete the following file due to a problem in the NPM package.

```sh
rm -f node_modules/hookrouter/dist/index.d.ts
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

- [] An error will be reported in the main network transfer
