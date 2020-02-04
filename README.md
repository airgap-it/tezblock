<img src="./src/assets/img/tezblock-logo.png" width="200px">

# tezblock

tezblock is a block explorer for [Tezos](https://tezos.com) an open-source platform for assets and applications backed by a global community of validators, researchers, and builders. tezblock is being built by [Papers](https://papers.ch/en) the team behind [AirGap](https://airgap.it).

👉 [tezblock.io](https://tezblock.io) for the live version.

## Local Deployment

tezblock depends on the [Conseil](https://github.com/Cryptonomic/Conseil) protocol indexer. Follow the steps to deploy Conseil locally or read through the [README](https://github.com/Cryptonomic/Conseil/blob/master/README.md) in the Conseil GitHub repository.

### Build and deploy Conseil

Clone the Conseil repository and `cd` into the cloned folder.

    git clone https://github.com/Cryptonomic/Conseil.git
    cd Conseil

Build the Conseil docker image

    docker build -t conseil .

Edit `docker-compose.yml` by changing the `image` value for the `conseil` and `lorre` services to `conseil` in order to use the docker image built in the previous step, or just leave the preconfigured value to use the published image.

Edit `docker-compose.yml` by changing the `XTZ_Scheme`, `XTZ_Host`, `XTZ_Port` and `XTZ_Network` values to point to your own Tezos node, or just leave the preconfigured value to use the Cryptonomic node.

#### Optional - Conseil performance optimization

To increase performance, uncomment the following line in the `docker-compose.yml` file:

    "./sql/conseil.sql:/docker-entrypoint-initdb.d/conseil.sql"

Edit the `sql/conseil.sql` file by adding:

- `ALTER ROLE conseiluser SET search_path TO tezos,public;`
- `ALTER DATABASE "conseil-local" SET search_path TO tezos,public;`
- `CREATE INDEX ix_accounts_history_account_id ON tezos.accounts_history USING hash (account_id);`
- `CREATE INDEX ix_operations_level ON tezos.operations USING hash (level);`
- `CREATE INDEX ix_operations_level_kind ON tezos.operations USING btree (level,kind);`
- `CREATE INDEX ix_operations_manager_pubkey ON tezos.operations USING hash (manager_pubkey);`
- `CREATE INDEX ix_operations_operation_group_hash ON tezos.operations USING hash (operation_group_hash);`

Run the Conseil instance

    docker-compose up -d

#### Setup local Tezos node

To run a Tezos node locally, clone Nautilus:

    git clone https://github.com/airgap-it/Nautilus.git

From the cloned repository, run:

    bash ./docker/nautilus.sh -t

The above command will create and start a docker container with a Tezos node running in archive mode. The docker image name is `tezos-node-local`.

### Build and deploy tezblock

Clone the tezblock repository and `cd` into the cloned folder.

    git clone https://github.com/airgap-it/tezblock
    cd tezblock

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
