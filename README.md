<img src="./src/assets/img/tezblock-logo.png" width="200px">

# tezblock

tezblock is a block explorer for [Tezos](https://tezos.com) an open-source platform for assets and applications backed by a global community of validators, researchers, and builders. tezblock is being built by [Papers](https://papers.ch/en) the team behind [AirGap](https://airgap.it).

👉 [tezblock.io](https://tezblock.io) for the live version.

## Local Deployment

tezblock depends on the [Conseil](https://github.com/Cryptonomic/Conseil) protocol indexer. Follow the steps to deploy Conseil locally or read through the [README](https://github.com/Cryptonomic/Conseil/blob/master/README.md) in the Conseil GitHub repository.

### Build and deploy tezblock

Clone the tezblock repository.

    git clone https://github.com/airgap-it/tezblock

Edit the `src/environments/environment.ts` and `src/environments/environment.prod.ts` files and change:

- `MAINNET_RPC_URL` URL to the JSON RPC interface of a Tezos node
- `MAINNET_CONSEIL_URL` URL of a running Conseil service
- `MAINNET_CONSEIL_API_KEY` API key for the Conseil service
- `MAINNET_TARGET_URL` Value can be set to the URL tezblock will be accessible from. Only needed if switching between the different network deployments is desired, otherwise this can be ignored

If support for multiple networks is needed, similarly edit the `BABYLONNET_` and `CARTHAGENET_` values, or ignore them otherwise.

From the root of the tezblock folder, execute the following command to build tezblock:

    npm install
    npm run build

To start tezblock on http://localhost:4200, execute:

    npm run start
