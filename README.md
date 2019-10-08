<img src="./src/assets/img/tezblock-logo.png" width="200px">

# tezblock

tezblock is a block explorer for [Tezos](https://tezos.com) an open-source platform for assets and applications backed by a global community of validators, researchers, and builders. tezblock is being built by [Papers](https://papers.ch/en) the team behind [AirGap](https://airgap.it).

👉 [tezblock.io](https://tezblock.io) for the live version.

## Local Deployment

tezblock depends on the [Conseil](https://github.com/Cryptonomic/Conseil) protocol indexer. It is possible to deploy Conseil locally, [Nautilus](https://github.com/airgap-it/Nautilus) allows to do that easily.

### Prerequisites

- Linux or macOS.
- Java SE Development Kit 8 (JDK 8).
- Docker.
- Node.js 10 or above.

### Build and deploy Conseil

Install `sbt`, the Scala build tool:

On Linux:

    sudo apt-get install -y sbt

On macOS:

    brew install sbt

Clone Nautilus:

    git clone https://github.com/airgap-it/Nautilus.git

If there is no Tezos node running in archive mode available, then Nautilus can be used to deploy one locally. From the Nautilus folder cloned in step 2, execute:

    bash ./docker/nautilus.sh -t

The above command will create and start a docker container with a Tezos node running in archive mode. The docker image name is `tezos-node-local`.

If a Tezos node running in archive mode is available, configure Conseil to point to that node in `Nautilus/docker/config/local/conseil/conseil.conf`.
Conseil needs access to a Postgres database. From the Nautilus folder, execute:

    bash ./docker/nautilus.sh -d

The above command will create and start a docker container with the Postgres database. The docker image name is `postgres-local`.
Build and deploy Conseil. From the Nautilus folder, execute:

    bash ./docker/nautilus.sh -c

The above command will create and start a docker container with Conseil running and listening on port 1337. The docker image name is `conseil-local`. The API key need to send requests to the Conseil REST interface can be found in `Nautilus/docker/config/local/conseil/conseil.conf`. The default value is `aminal`.

### Build and deploy tezblock

Clone the tezblock repository.

    git clone https://github.com/airgap-it/tezblock

Change the value of `conseilBaseUrl` in `src/environments/environment.ts` to point to the locally deployed instance of Conseil, http://localhost:1337. Also change the `conseilApiKey` value to the API key of your local Conseil instance.

From the root of the tezblock folder, execute the following command to build tezblock:

    npm install
    npm run build

To start tezblock on http://localhost:4200, execute:

    npm run start
