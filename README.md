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
To address the problem we used a hybrid system, that utilizes some distributed services and a web service.

**Note:** This repository contains an example of a solution developed exclusively for the E-agle team of the University of Trento.

#### Distributed part
This part consists in:
- Certificate smart contract
- E-agle smart contract
- IPFS

The **certificate smart contract** manages the certificates, represented as NFTs, uploaded/minted by the users or the leader.
The **E-agle smart contract** manages the roles of the users.
**IPFS** is used to store the PDFs of the certificates and the metadata describing it. The files are pinned using Pinata.

#### Web service
Consists only of an **express** server which is used to interact with Pinata and MongoDB.

<p align="center">
  <img alt="Architecture" height="800" src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/ef9e02b5-64bf-44c9-8a44-6ca99d470c1d">
<p />

# 🛰 Repository structure
#### branch: develop

The purpose of this branch is to facilitate collaboration among the team members throughout the development process. For our solution's latest official and stable release, please refer to the `main` branch.
From this branch, other branches are created to experiment with specific functionalities.

#### Main folders
```
    .
    ├── contracts                   # Smart contracts files 
    ├── migrations                  # Files needed by Truffle to deploy the smart contracts
    ├── models                      # MongoDB models
    ├── routes                      # ExpressJs routes
    ├── src                         # Source files 
    ├── test                        # Smart contract tests
    └── ...
```
#### Src folder main files
```
   .
    ├── ...
    ├── src                   
    │   ├── css         
    │   ├── js        
    │   │   ├── app.js               # Contains all the code that makes the Dapp woork
    │   └── index.html               # Initial html template
    └── ...
```
#### Root folder main files
```
    .
    ├── ...                 
    ├── .env.example                  # .env file example
    ├── index.js                      # Initialize the web service
    ├── server.js                     # Web service configurations
    ├── truffle-config.js             # Contains teh configuration of truffle 
    └── ...                        
```

# ⚙ Built with
This project was done with the following technologies
### Frontend
- HTML
- JS
- CSS
- [Web3.js](https://web3js.readthedocs.io/en/v1.3.4/)
- [Bootsrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)

### Backend
- [Express](https://expressjs.com/pt-br/)
- [Multer](https://github.com/expressjs/multer)
- [Axios](https://axios-http.com/docs/intro)
- [Pinata](https://www.pinata.cloud/)

### Blockchain and Smart Contracts
- [Solidity](https://docs.soliditylang.org/en/v0.8.20/)
- [Ganache](https://trufflesuite.com/ganache/)
- [Truffle](https://trufflesuite.com/)
- [Metamask](https://metamask.io/)

# 🕹 Run the Dapp
### Requirements
To run this application you will need:
- [Node](https://nodejs.org/en)
- [Ganache](https://trufflesuite.com/ganache/)
- [Truffle](https://trufflesuite.com/)

### Blockchain
- Run ganache
- Compile and deploy the smart contracts
  
  ```
  truffle compile
  truffle migrate
  ```
**Note:** Make sure the RPC Server port in ganache and truffle-config.js are the same. By default it should be 7545.

### Backend and frontend

#### Import an account on Metamask

1. In ganache, choose an address and click the key icon on the left

<p align="center">
  <img src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/8e25f273-be7b-446a-980d-7d626388fe7d" alt="How to import an account from private key" height="529">
<p />

3. A new box will open, displaying the public and private keys
4. Copy the **private key**

<p align="center">
  <img src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/85be9a34-0451-4172-9713-d90f140b7541" alt="How to import an account from private key" height="529">
<p />
   
5. Open Metamask on the browser
6. Click the circle icon at the top right corner of your MetaMask pop-up next to the network indicator.
7. Select "Import Account" on the dropdown menu:
8. You will be directed to the Import page. Paste your private key and click "Import".
   
<p align="center">
  <img src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/7ed9752e-ff1a-4730-945d-678aabfd0cfd" alt="How to import an account from private key" width="315" height="529">
<p />

#### Connect Metamask to Ganache
Now we need to connect MetaMask to the blockchain created by Ganache. 

1. Click on the network selector button. This will display a list of networks to which you're already connected.
2. Click "Add network":

<p align="center">
  <img src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/eb8dffe7-cc7d-4851-92ef-c8f84166dace" alt="How to import an account from private key" width="315" height="529">
<p />

3. A new browser tab will open, displaying various fields to fill out:

<p align="center">
  <img src="https://github.com/StefanoGenettiUniTN/decentralised-certificate-management/assets/29599452/7070e1ad-2b03-412e-8b50-c58cdfd0468a" alt="How to import an account from private key" height="529">
<p />

4. Fill the fields with these values:
  - **Name:** it can be anything you like
  - **New RPC URL:** HTTP://127.0.0.1:7545
  - **Chain ID:** 1337
  - **Currency symbol:** ETH
5. Click "Save"

#### Starting the web service
All the following commands must be executed in the root folder of the repository

2. Copy **.env.local.example** to **.env** and fill it with environment variables
3. Start the express server

    ```
   npm run start_local
   ```
5. The frontend app is now available at 127.0.0.1:8080

#### Use the Dapp
1. Connect with metamask
