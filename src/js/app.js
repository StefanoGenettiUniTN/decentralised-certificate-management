App = {
  web3Provider: null,
  account: null,
  contracts: {},

  init: function() {
    console.log("Initialization function")
    if(App.account){
      mainContent.innerHTML = `Wallet connected: <span>${App.account}</span>`;
    }else{
      App.displayConnectMetamask();
    }
  },

  //If the user is not logged with the wallet, display connect to Metamask button
  displayConnectMetamask: function(){
    mainContent.innerHTML = '<button class="button" id="connectButton" onclick="App.connectMetamask()">Connect wallet</button>';
  },

  initWeb3: async function() {
    if(window.ethereum){
      App.web3Provider = window.ethereum;
      try{
        //Request account access
        await window.ethereum.enable();
      }catch(error){
        //User denied account access...
        console.error("User denied account access");
      }
      web3 = new Web3(App.web3Provider);
      App.initContracts();
    }else{
      alert("error metamask is required");
    }
  },

  initContracts: function() {
    //Certificate smart contract
    $.getJSON("Certificate.json", function(data){
      //Get the necessary contract artifact file and instantiate it with @truffle/contract
      var CertificateArtifact = data;
      App.contracts.Certificate = TruffleContract(CertificateArtifact); //this creates an instance of the contract we can interact with

      //Set the provider for our contract
      App.contracts.Certificate.setProvider(App.web3Provider);
    });

    console.log("Certificate smart contract loaded.");
    
    //Eagle smart contract
    $.getJSON("Eagle.json", function(data){
      //Get the necessary contract artifact file and instantiate it with @truffle/contract
      var EagleArtifact = data;
      App.contracts.Eagle = TruffleContract(EagleArtifact); //this creates an instance of the contract we can interact with

      //Set the provider for our contract
      App.contracts.Eagle.setProvider(App.web3Provider);
    });
    
    console.log("Eagle smart contract loaded.");
  },

  //The user clicks on Connect wallet
  connectMetamask: function(){
    if (typeof window.ethereum !== "undefined") {
      ethereum.request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          App.account = accounts[0];

          App.initWeb3();
          
          mainContent.innerHTML = `Wallet connected: <span>${App.account}</span>`;
        })
        .catch((error) => {
          console.log(error, error.code);
          errorMsg.innerHTML = "Unable to access wallet account";
        });
    } else {
      //window.open("https://metamask.io/download/", "_blank");
      errorMsg.innerHTML = "Please, install metamask";
    }
  },

  //List the certificates which is owned by the current user
  displayCertificates: function(){
    if(App.account){
      App.contracts.Certificate.deployed().then(function(instance){
        certificateInstance = instance;       
        return certificateInstance.getTokensOwnedByMe({from: App.account});
      }).then(function(result){
        console.log(result);
        mainContent.innerHTML = `
          <br>
          <p>Ciao</p>
        `;
      }).catch(function(err){
        console.log("error:")
        console.log(err.message);
      });
    }else{
      App.displayConnectMetamask();
    }
  },

  // Page: upload certificate
  // load the user interface
  displayUploadCertificateForm: function(){
    if(App.account){
      mainContent.innerHTML = `
        <br>
        <input type="text" id="cert_uri" placeholder="URI"/><br>
        <button onclick="App.mintNFT()">CREATE</button>
      `;
    }else{
      App.displayConnectMetamask();
    }
  },

  // create new certificate
  mintNFT: async function(){

    let uri = $("#cert_uri").val();

    App.contracts.Certificate.deployed().then(async function(instance){
      certificateInstance = instance;
      console.log(uri);

      try {
        // Call the mintToken smart contract function to issue a new token
        // to the given address. This returns a transaction object, but the 
        // transaction hasn't been confirmed yet, so it doesn't have our token id.      
        const result = await certificateInstance.safeMint(uri, {from: App.account});

        // The OpenZeppelin base ERC721 contract emits a Transfer event 
        // when a token is issued. tx.wait() will wait until a block containing 
        // our transaction has been mined and confirmed. The transaction receipt 
        // contains events emitted while processing the transaction.
        var event = certificateInstance.Transfer(function(error, response) {
          if (!error) {
              console.log(response.args.tokenId.toString())
          }else{
              console.log(error);
          }
        });
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  },

  // display profile
  displayProfile: async function(){
    if(App.account){
      let role = "";
      let instance = await App.contracts.Eagle.deployed()
      try {
        let contractRole = await instance.getMemberRole(App.account);
        if(contractRole === "Team Leader"){
          role = "You are the <strong>team leader</strong>";
        } else {
          role = "You are <b>not</b> the team leader";
        }
        console.log(role);console.log(contractRole);
      } catch(err){
        console.log("error:");
        console.log(err);
      }
      mainContent.innerHTML = `Welcome back `+App.account+`. `+role;
    }else{
      App.displayConnectMetamask();
    }
  },

  // manage team webpage
  displayTeam: async function(){
    if(App.account){
      mainContent.innerHTML = `
        <label for="memberAddress">Add team member</label><br>
        <input type="text" id="memberAddress" name="memberAddress"><br>
        <label for="memberRole">What is its role?</label><br>
        <select id="memberRole" size="2">
          <option value="0">Team leader</option>
          <option value="1">Standard</option>
        </select>
        <button onclick="App.addTeamMember()">Add</button>
        <hr>
        <div id="teamList"></div>
      `;
      
      let eagleContractInstance = await App.contracts.Eagle.deployed();
      eagleContractInstance.getTeamMembers().then(function(result){
        for(teamMember in result){
          document.getElementById("teamList").innerHTML += `<p>`+result[teamMember]+`</p>`;
        }
      }).catch(function(err){
        console.log("error:")
        console.log(err.message);
      });

    }else{
      App.displayConnectMetamask();
    }
  },

  // Add a new team member wallet address
  addTeamMember: function(){
    let userWalletAddress = $("#memberAddress").val();
    let userRole = $("#memberRole").val();

    App.contracts.Eagle.deployed().then(async function(instance){
      EagleInstance = instance;

      try {        
        let result = await EagleInstance.addTeamMember(userWalletAddress, userRole, {from: App.account});
        App.displayTeam();
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  },

  getMemberRole: function(){
    let role = "";
    App.contracts.Eagle.deployed().then(async function(instance){
      try {
        let contractRole = await instance.getMemberRole(App.account);
        if(contractRole === "Team Leader"){
          role = "You are the <strong>team leader</strong>";
        } else {
          role = "You are <b>not</b> the team leader";
        }
        console.log(role);
        return role;
      } catch(err){
        console.log("error:");
        console.log(err);
      }
      console.log(contractRole);
    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  }
};