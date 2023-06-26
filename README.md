# Blockchain course project 2023: Enhancing Certificate Management through Blockchain Technology
### University of Trento
### Academic year: 2022-2023 

# 📕 Table of contents
- Introduction
- Repository structure
- Built with
- Run the Dapp

# 📝 Introduction
This Dapp was built as a study project for the **Blockchain course** by:
- Eros Ribaga
- Pietro Fronza
- Stefano Genetti
  
This project aims to create a Dapp that can improve the workflow in organizing the certificate of the members of a group, such as a team or a company.
To address the problem we used a hybrid system, that utilizes both a distributed and a centralized service.

**Note:** This repository contains an example of a solution developed exclusively for the E-agle team of the University of Trento.

#### Distributed part
This part consists in:
- Certificate smart contract
- E-agle smart contract
- IPFS

The **certificate smart contract** manages the certificates, represented as NFTs, uploaded/minted by the users or the leader.
The **E-agle smart contract** manages the roles of the users.
**IPFS** is used to store the PDFs of the certificates and the metadata describing it. The files are pinned using Pinata.

#### Centralized part
Consists only of an **express** server which is used to interact with Pinata.

<p align="center">
  <img alt="Architecture" height="500" src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/ed66b9d3-4344-4bcb-b89b-c91def46a438">
<p />


# 🛰 Repository structure
#### branch: develop

The purpose of this branch is to facilitate collaboration among the team members throughout the development process. For our solution's latest official and stable release, please refer to the `main` branch.
From this branch, other branches are created to experiment with specific functionalities.

# ⚙ Built with
This project was done with the following technologies
### Frontend
- [Web3.js](https://web3js.readthedocs.io/en/v1.3.4/)

### Backend
- [Express](https://expressjs.com/pt-br/)
- [Multer](https://github.com/expressjs/multer)
- [Axios](https://axios-http.com/docs/intro)
- [Pinata](https://www.pinata.cloud/)

### Blockchain and Smart Contracts
- [Solidity](https://docs.soliditylang.org/en/v0.8.20/)
- [Ganache](https://trufflesuite.com/ganache/)
- [Truffle](https://trufflesuite.com/)

# 🕹 Run the Dapp
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
