# Blockchain course project 2023: Enhancing Certificate Management through Blockchain Technology
## University of Trento
## Academic year: 2022-2023
### Eros Ribaga, Pietro Fronza, Stefano Genetti

#### branch: develop

The purpose of this branch is to facilitate the collaboration among the team members throughout the development process. For the latest official and stable release of our solution, please refer to the `main` branch.
From this branch other branches are created to experiment with specific functionalities.

### branch: nft-experiment

In this branch we are going to learn how to create an nft smart contract and to interact with it.

# 🛰 Project structure
![Blockchain flow](https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/8a090a36-9ce2-4eeb-8a9d-530299d8df86)

# ⚙ Built with
This project was made with the following technologies
### Frontend
- [Web3.js](https://web3js.readthedocs.io/en/v1.3.4/)

### Backend


### Blockchain and Smart Contracts <sub><sup>Solidity</sup></sub>

# 🕹 Run the Dapp locally
### Requirements
To run this application you will need:
- [Node](https://nodejs.org/en)
- [Ganache](https://trufflesuite.com/ganache/)
- [Truffle](https://trufflesuite.com/)

### Blockchain
- Run ganache
- Compile and deploy the smart contracts with `truffle migrate`

**Note:** Make sure the RPC Server port is the same in ganache and truffle-config.js. By default it should be 7545.


### Backend and frontend
- Copy .env.local.example to .env.local and fill it with environment variables
- Run `npm run start_local` to start the express server
- The frontend app is now available at 127.0.0.1/8080
- Make sure to use Localhost 7545 as the Metamask's network 
- Make sure to import a local Account into Metamask accounts.
