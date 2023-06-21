App = {
  web3Provider: null,
  account: null,
  contracts: {},

  init: function() {
    console.log("Initialization function")
    App.showSpinner();
    if(App.account){
      mainContent.innerHTML = `Wallet connected: <span>${App.account}</span>`;
    }else{
      App.displayConnectMetamask();
    }
    App.hideSpinner();
  },

  //If the user is not logged with the wallet, display connect to Metamask button
  displayConnectMetamask: function(){
    mainContent.innerHTML = '<button class="button" id="connectButton" onclick="App.connectMetamask()">Connect wallet</button>';
    accountaddress.innerHTML = '';
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

  initContracts: async function() {
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
    App.showSpinner();
    if (typeof window.ethereum !== "undefined") {
      ethereum.request({ method: "eth_requestAccounts" })
        .then(async (accounts) => {
          App.account = accounts[0];

          App.initWeb3();
          
          mainContent.innerHTML = `Wallet connected: <span>${App.account}</span>`;
          accountaddress.innerHTML = `<ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#" onclick='App.displayProfile();'><span class="material-symbols-outlined">account_circle</span><span>${App.account}</span></a></li></ul><button type="button" class="btn btn-danger position-relative" onclick="App.disconnectMetamask();">Logout</button>`
        })
        .catch((error) => {
          console.log(error, error.code);
          errorMsg.innerHTML = "Unable to access wallet account";
        });
    } else {
      //window.open("https://metamask.io/download/", "_blank");
      errorMsg.innerHTML = "Please, install metamask";
    }
    App.hideSpinner();
  },

  //List the certificates which is owned by the current user
  displayCertificates: function(){
    App.showSpinner();
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
        if(result.length>0){
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
        } else {
          certificateList.innerHTML=`
            <div class="alert alert-warning" role="alert">
              You don\'t have any certificate to show!
            </div>
          `
        }
      }).catch(function(err){
        console.log("error:")
        console.log(err.message);
      });
    }else{
      App.displayConnectMetamask();
    }
    App.hideSpinner();
  },

  // Page: upload certificate
  // load the user interface
  displayUploadCertificateForm: function(){
    App.showSpinner();
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
    App.hideSpinner();
  },

  // create new certificate
  mintNFT: async function(){
    App.showSpinner();
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
    App.hideSpinner();
  },

  // display profile
  displayProfile: async function(){
    App.showSpinner();
    if(App.account){
      let role = "";
      let instance = await App.contracts.Eagle.deployed()
      try {
        let contractRole = await instance.getMemberRole(App.account);
        if(contractRole === "TL"){
          role = "You are the <strong>team leader</strong>";
        } else {
          role = "You are <b>not</b> the team leader";
        }
      } catch(err){
        console.log("error:");
        console.log(err);
      }
      mainContent.innerHTML = `Welcome back `+App.account+`. `+role;
    }else{
      App.displayConnectMetamask();
    }
    App.hideSpinner();
  },

  // manage team webpage
  displayTeam: async function(){
    App.showSpinner();
    if(App.account){
      let eagleContractInstance = await App.contracts.Eagle.deployed();
      let members = await eagleContractInstance.getTeamMembers();
      let role = await eagleContractInstance.getMemberRole(App.account);
      if(role!='TL' && role!=undefined){
        mainContent.innerHTML = `
          <span>You are not a <strong>Team Leader</strong>. You cannot see the content of this page.</span><br>
          <span>You can click any other element in the menu to use the application.</span>
        `
      } else {
        mainContent.innerHTML = `
          <div class='form-row'>
            <div class='form-group col-md-6'>
              <label for="memberAddress">Add team member</label><br>
              <input type="text" class='form-control' id="memberAddress" name="memberAddress"><br>
              <div class='row'> 
                <div class='col'>
                  <label for="memberName">Add team member name</label><br>
                  <input type="text" class='form-control' id="memberName" name="memberName"><br>
                </div>
                <div class='col'>
                  <label for="memberSurname">Add team member surname</label><br>
                  <input type="text" class='form-control' id="memberSurname" name="memberSurname"><br>
                </div>
              </div>
              <label for="memberRole">What is its role?</label><br>
              <select id="memberRole" class='form-control'>
                <option value="0">Team leader</option>
                <option value="1">Standard</option>
              </select><br>
            <button onclick="App.addTeamMember()" class='btn btn-primary mb-2'>Add</button>
            </div>
          </div>
          <hr>
          <div class='form-row'>
          <div id="teamList" class='list-group list-group-flush'></div>
          </div>
        `;
        
        
        for(teamMember in members){
          role = await eagleContractInstance.getMemberRole(members[teamMember]);
          if(role === "TL"){
            document.getElementById("teamList").innerHTML += `<div class='list-group-item list-group-item-action'><span class="material-symbols-outlined">supervisor_account</span>  <span id='address'>`+members[teamMember]+`</span>\xa0\xa0\xa0<button class='btn btn-primary' onclick='App.displaySpecificUserCertificates("`+members[teamMember]+`");'>Show certificates</button></div><br>`;
          } else {
            document.getElementById("teamList").innerHTML += `<div class='list-group-item list-group-item-action'><span class="material-symbols-outlined">account_circle</span>  <span id='address'>`+members[teamMember]+`</span>\xa0\xa0\xa0<button class='btn btn-primary' onclick='App.displaySpecificUserCertificates("`+members[teamMember]+`");'>Show certificates</button></div><br>`;
          }
          
        }
      }
    }else{
      App.displayConnectMetamask();
    }
    App.hideSpinner();
  },

  // Add a new team member wallet address
  addTeamMember: function(){
    App.showSpinner();
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
    App.hideSpinner();
  },

  // Delete NFT
  deleteNFT: function(tokenId){
    App.showSpinner();
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
    App.hideSpinner();
  },

  // Invalidate NFT
  invalidateNFT: function(tokenId, address){
    App.showSpinner();
    App.contracts.Certificate.deployed().then(async function(instance){
      CertificateInstance = instance;

      try {
        if(confirm("Are you sure to set the certificate not valid?")){        
          let result = await CertificateInstance.setCertificateNotValid(tokenId, {from: App.account});
        }
        if(address==undefined){
          App.displayCertificates();
        } else {
          App.displaySpecificUserCertificates(address);
        }
        
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
    App.hideSpinner();
  },

  // Set the NFT as valid
  validateNFT: function(tokenId, address){
    App.showSpinner();

    console.log("validate "+tokenId);

    App.contracts.Certificate.deployed().then(async function(instance){
      CertificateInstance = instance;

      try {
        if(confirm("Are you sure to set the certificate valid?")){        
          let result = await CertificateInstance.setCertificateValid(tokenId, {from: App.account});
        }
        if(address==undefined){
          App.displayCertificates();
        } else {
          App.displaySpecificUserCertificates(address);
        }
      }catch(err){
        console.log("error:")
        console.log(err);
      }

    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });
    App.hideSpinner();
  },

  // disconnect Metamask wallet
  disconnectMetamask: async function(){
    App.showSpinner();
    if(App.account){
      window.localStorage.clear();
      App.account = null;
      App.displayConnectMetamask();
    }
    App.hideSpinner();
  },

  // Show loading page
  showSpinner: function(){
    spinnerwrapper.style.display = '';
  },

  // Hide loading page
  hideSpinner: function(){
    setTimeout(() => {
      spinnerwrapper.style.display = 'none';
    }, 1000);
  },

  // Display the single team member and its certificates
  displaySpecificUserCertificates: function(user_address){
    console.log(user_address);
    App.showSpinner();
    if(App.account){
      App.contracts.Certificate.deployed().then(function(instance){
        certificateInstance = instance;       
        return certificateInstance.getTokensOwnedByAnotherUser(user_address, {from: App.account});
      }).then(async function(result){
        console.log(result);
        mainContent.innerHTML = `
          <button id='back' class='btn btn-primary' onclick="App.displayTeam();">Back</button>
          <br>
          <p>You are viewing the certificates of user <strong>${user_address}</strong></p>
          <div id="certificateList" class='row row-cols-1 row-cols-md-3'></div>
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
              <div class="col mb-4">
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
                    <button class="btn btn-warning" onclick="App.invalidateNFT('`+token_id+`', '`+user_address+`')">Invalidate</button>
                    <button class="btn btn-warning" onclick="App.validateNFT('`+token_id+`', '`+user_address+`')">Set valid</button>
                  </div>
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
    App.hideSpinner();
  }
};