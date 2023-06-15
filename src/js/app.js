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
      }).then(async function(result){
        console.log(result);
        mainContent.innerHTML = `
          <br>
          <div id="certificateList"></div>
        `;
        
        let token_id;
        let cert_uri;
        for(cert in result){
          token_id = parseInt(result[cert]);
          
          console.log("token_id: "+token_id);

          // for each retrived certificate id we need to read the corresponding uri
          // to get the data we are interested in
          cert_uri = await certificateInstance.tokenURI.call(token_id);
          console.log(cert_uri);

          // for each retrived certificate id we need to
          // check whether or not it is still valid
          cert_valid = await certificateInstance.tokenIsValid.call(token_id);
          console.log("valid: "+cert_valid);

          //JSON parsing
          await $.getJSON(cert_uri, function(result){
            console.log(result);
            
            let name = result.name;
            let description = result.description;
            let document = result.document;
            let category = result.category;
            let date_achievement = result.date_achievement;
            let date_expiration = result.date_expiration;
            let issuing_authority = result.issuing_authority;

            $("#certificateList").append(`
                <div class="card" style="width: 25rem;">
                  <img src="images/defaultCertificateIcon.png" class="card-img-top">
                  <div class="card-body">
                  <h5 class="card-title">`+name+`</h5>
                  <p class="card-text">`+description+`</p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>achievement date: </b>`+date_achievement+`</li>
                    <li class="list-group-item"><b>expiration date: </b>`+date_expiration+`</li>
                    <li class="list-group-item"><b>issuing authority: </b>`+issuing_authority+`</li>
                    <li class="list-group-item"><b>category: </b>`+category+`</li>
                    <li class="list-group-item"><b>validity: </b>`+cert_valid+`</li>
                  </ul>
                  <div class="card-body">
                    <a href="`+document+`" class="btn btn-info" target="_blank">Download</a>
                    <button class="btn btn-danger" onclick="App.deleteNFT('`+token_id+`')">Delete</button>
                    <button class="btn btn-warning" onclick="App.invalidateNFT('`+token_id+`')">Invalidate</button>
                    <button class="btn btn-warning" onclick="App.validateNFT('`+token_id+`')">Set valid</button>
                  </div>
                </div>
              `);            

          }).fail(function() { alert('getJSON request failed! '); }); //TODO: prepare more meaningful error handling
          //...end JSON parsing
        }

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
        <label for="cert_uri"><b>File URI: </b></label>
        <input type="text" id="cert_uri" placeholder="URI"/><br>
        <label for="cert_expdate"><b>Expiration date: </b></label>
        <input type="date" id="cert_expdate" placeholder="URI"/><br>
        <label for="cert_noexpdate"><b>Unlimited duration: </b></label>
        <input id="cert_noexpdate" type="checkbox" /><br>
        <button onclick="App.mintNFT()">CREATE</button>
      `;
    }else{
      App.displayConnectMetamask();
    }
  },

  // create new certificate
  mintNFT: async function(){
    let uri = $("#cert_uri").val();
    let expiration_date = $("#cert_expdate").val();
    let expiration_date_epoch = Math.floor(new Date(expiration_date).getTime() / 1000);
    let unlimited_duration = $('#cert_noexpdate').is(':checked')

    console.log("uri");
    console.log(uri);
    console.log("expiration_date");
    console.log(expiration_date);
    console.log("expiration_date_epoch");
    console.log(expiration_date_epoch);
    console.log("unlimited_duration");
    console.log(unlimited_duration);

    App.contracts.Certificate.deployed().then(async function(instance){
      certificateInstance = instance;

      try {
        // Call the mintToken smart contract function to issue a new token
        // to the given address. This returns a transaction object, but the 
        // transaction hasn't been confirmed yet, so it doesn't have our token id.      
        const result = await certificateInstance.safeMint(uri, expiration_date_epoch, unlimited_duration, {from: App.account});

        // The OpenZeppelin base ERC721 contract emits a Transfer event 
        // when a token is issued.
        var event = certificateInstance.Transfer(function(error, response) {
          if (!error) {
              console.log(response.args.tokenId.toString());
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
  displayProfile: function(){
    if(App.account){
      mainContent.innerHTML = `Welcome back `+App.account+``;
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

    App.contracts.Eagle.deployed().then(async function(instance){
      EagleInstance = instance;

      try {        
        let result = await EagleInstance.addTeamMember(userWalletAddress, {from: App.account});
        App.displayCertificates();
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  },

  // Delete NFT
  deleteNFT: function(tokenId){

    App.contracts.Certificate.deployed().then(async function(instance){
      CertificateInstance = instance;

      try {
        if(confirm("Are you sure to delete the certificate?")){        
          let result = await CertificateInstance.deleteNFT(tokenId, {from: App.account});
        }
        App.displayCertificates();
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  },

  // Invalidate NFT
  invalidateNFT: function(tokenId){
    App.contracts.Certificate.deployed().then(async function(instance){
      CertificateInstance = instance;

      try {
        if(confirm("Are you sure to set the certificate not valid?")){        
          let result = await CertificateInstance.setCertificateNotValid(tokenId, {from: App.account});
        }
        App.displayCertificates();
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  },

  // Set the NFT as valid
  validateNFT: function(tokenId){
    App.contracts.Certificate.deployed().then(async function(instance){
      CertificateInstance = instance;

      try {
        if(confirm("Are you sure to set the certificate valid?")){        
          let result = await CertificateInstance.setCertificateValid(tokenId, {from: App.account});
        }
        App.displayCertificates();
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
  }
};