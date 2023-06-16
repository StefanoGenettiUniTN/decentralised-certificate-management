App = {
  web3Provider: null,
  account: null,
  contracts: {},

  init: function() {
    console.log("Initialization function")
    if(App.account){
      mainContent.innerHTML = `
            <div class="jumbotron">
              <h1 class="display-4">Decentralised certificate managament</h1>
              <p class="lead">This is the minimum value product of our service. Any feedback is more than welcome!</p>
              <p class="lead"><i>Eros Ribaga, Stefano Genetti, Pietro Fronza</i></p>
              <hr class="my-4">
              <p class="lead">
                <div class="alert alert-success" role="alert" style="width: 30rem;">
                  Wallet successfully connected!
                </div>
                <p><b>Wallet address:</b> ${App.account}</p>
                <p>Explore the content of the DApp using the navigation bar. For any doubt, do not esitate to contact us!</p>
                <div class="card" style="width: 30rem;">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>eros ribaga: </b>eros.ribaga@student.unitn.it</li>
                    <li class="list-group-item"><b>stefano genetti: </b>stefano.genetti@student.unitn.it</li>
                    <li class="list-group-item"><b>pietro fronza: </b>pietro.fronza@student.unitn.it</li>
                  </ul>
                </div>
              </p>
            </div>
          `;
    }else{
      App.displayConnectMetamask();
    }
  },

  //If the user is not logged with the wallet, display connect to Metamask button
  displayConnectMetamask: function(){
    mainContent.innerHTML = `
      <div class="jumbotron">
        <h1 class="display-4">Decentralised certificate managament</h1>
        <p class="lead">This is the minimum value product of our service. Any feedback is more than welcome!</p>
        <p class="lead"><i>Eros Ribaga, Stefano Genetti, Pietro Fronza</i></p>
        <hr class="my-4">
        <p>In order to use our service, a <b>Metamask</b> wallet is required. If you do not have a Metamask wallet, please refer to the <a href="https://metamask.io/" target="_blank">offical website</a>.</p>
        <p class="lead">
          <button type="button" class="btn btn-primary btn-lg text-center" id="connectButton" onclick="App.connectMetamask()"><img class="mb-2 mr-2" src="images/metamask.png" style="width: 50px;"/>Connect wallet</button>
        </p>
      </div>
    `;
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
          
          mainContent.innerHTML = `
            <div class="jumbotron">
              <h1 class="display-4">Decentralised certificate managament</h1>
              <p class="lead">This is the minimum value product of our service. Any feedback is more than welcome!</p>
              <p class="lead"><i>Eros Ribaga, Stefano Genetti, Pietro Fronza</i></p>
              <hr class="my-4">
              <p class="lead">
                <div class="alert alert-success" role="alert" style="width: 30rem;">
                  Wallet successfully connected!
                </div>
                <p><b>Wallet address:</b> ${App.account}</p>
                <p>Explore the content of the DApp using the navigation bar. For any doubt, do not esitate to contact us!</p>
                <div class="card" style="width: 30rem;">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>eros ribaga: </b>eros.ribaga@student.unitn.it</li>
                    <li class="list-group-item"><b>stefano genetti: </b>stefano.genetti@student.unitn.it</li>
                    <li class="list-group-item"><b>pietro fronza: </b>pietro.fronza@student.unitn.it</li>
                  </ul>
                </div>
              </p>
            </div>
          `;
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
  displayProfile: async function(){
    if(App.account){
      let role = "";
      let account_name= "";
      
      let instance = await App.contracts.Eagle.deployed()
      try {
        // get account role
        let contractRole = await instance.getMemberRole(App.account);
        if(contractRole === "Team Leader"){
          role = "You are the <strong>team leader</strong>";
        } else {
          role = "You are <b>not</b> the team leader";
        }
        console.log(role);console.log(contractRole);
        //...end get account role
      } catch(err){
        console.log("error:");
        console.log(err);
      }

      instance = await App.contracts.Certificate.deployed()
      try {
        // get certificates
        let accountCertificates = await instance.getTokensOwnedByMe({from: App.account});

        var expiredCertificates = [];    // certificates whose expiration date is smaller than the current date
        var mostRecentCertificates = []; // the last updloaded certificates

        for(cert in accountCertificates){
          let cert_obj = {
            id: null,
            valid: null,
            uri: null,
            name: null,
            description: null,
            document: null,
            category: null,
            date_creation: null,
            date_achievement: null,
            date_expiration: null,
            issuing_authority: null
          };

          token_id = parseInt(accountCertificates[cert]);
          cert_obj.id = token_id;
          console.log("token_id: "+token_id);

          // for each retrived certificate id we need to
          // check whether or not it is valid
          cert_valid = await instance.tokenIsValid.call(token_id);
          cert_obj.valid = cert_valid;
          console.log("valid: "+cert_valid);
          
          // get the creation date of each retrived
          // certificate in order to select the
          // (max 3) most recent certificates
          cert_creationDate = await instance.getCreationDate.call(token_id);
          cert_obj.date_creation = cert_creationDate;
          console.log("creation date: "+cert_creationDate);

          // get token uri
          cert_uri = await instance.tokenURI.call(token_id);
          cert_obj.uri = cert_uri;
          console.log(cert_uri);

          if(!cert_valid){  // if the certificate is not valid, then add to the expiredCertificates list
            await $.getJSON(cert_uri, function(result){ //get detailed certificate information              
              cert_obj.name = result.name;
              cert_obj.description = result.description;
              cert_obj.document = result.document;
              cert_obj.category = result.category;
              cert_obj.date_achievement = result.date_achievement;
              cert_obj.date_expiration= result.date_expiration;
              cert_obj.issuing_authority = result.issuing_authority;          
            }).fail(function() { alert('getJSON request failed! '); }); //TODO: prepare more meaningful error handling

            expiredCertificates.push(cert_obj);
          }

          mostRecentCertificates.push(cert_obj);
        }
        //...end get certficates
      } catch(err){
        console.log("error:");
        console.log(err);
      }

      // prepare notification html
      let html_notification = ``;
      if(expiredCertificates.length==0){
        html_notification += `<p>Hurray! All your certificates are valid.</p>`;
      }else{
        html_notification += `<p>The following certificates owned by you are expired or not valid:</p>`;
        html_notification += `<div class="overflow-auto" style="height: 500px; width: 55rem;">`;
        for(i in expiredCertificates){
          cert_obj = expiredCertificates[i];
          html_notification += `
                <div class="card mb-2" style="width: 50rem;">
                  <img src="images/defaultCertificateIcon.png" class="card-img-top" style="width: 33%">
                  <div class="card-body">
                  <h5 class="card-title">`+cert_obj.name+`</h5>
                  <p class="card-text">`+cert_obj.description+`</p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>achievement date: </b>`+cert_obj.date_achievement+`</li>
                    <li class="list-group-item"><b>expiration date: </b>`+cert_obj.date_expiration+`</li>
                    <li class="list-group-item"><b>issuing authority: </b>`+cert_obj.issuing_authority+`</li>
                    <li class="list-group-item"><b>category: </b>`+cert_obj.category+`</li>
                  </ul>
                  <div class="card-body">
                    <a href="`+cert_obj.document+`" class="btn btn-info" target="_blank">Download</a>
                  </div>
                </div>
              `;
        }
        html_notification += `</div>`;
      }
      //...

      // prepare last updated certificates html
      let html_lastCertificates = ``;
      if(mostRecentCertificates.length==0){
        html_lastCertificates += `<p>You have not uploaded any certificate yet.</p>`;
      }else{
        html_lastCertificates += `<p>The following are the last certificates you have uploaded:</p>`;
        html_lastCertificates += `<div class="overflow-auto" style="height: 500px; width: 55rem;">`;

        mostRecentCertificates.sort(function(a, b) {  // sort certificates by date of achievement
          return b.date_creation - a.date_creation;
        });

        for(let i = 0; i < Math.min(3, mostRecentCertificates.length); i++){  // get (max 3) most recent certificates
          cert_obj = mostRecentCertificates[i];
          if(cert_obj.name == null){ // the detailed information about this certificates have not been retrived from IPFS yet
            await $.getJSON(cert_obj.uri, function(result){         
              cert_obj.name = result.name;
              cert_obj.description = result.description;
              cert_obj.document = result.document;
              cert_obj.category = result.category;
              cert_obj.date_achievement = result.date_achievement;
              cert_obj.date_expiration= result.date_expiration;
              cert_obj.issuing_authority = result.issuing_authority;          
            }).fail(function() { alert('getJSON request failed! '); }); //TODO: prepare more meaningful error handling
          }
          html_lastCertificates += `
                <div class="card mb-2" style="width: 50rem;">
                  <img src="images/defaultCertificateIcon.png" class="card-img-top" style="width: 33%">
                  <div class="card-body">
                  <h5 class="card-title">`+cert_obj.name+`</h5>
                  <p class="card-text">`+cert_obj.description+`</p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>achievement date: </b>`+cert_obj.date_achievement+`</li>
                    <li class="list-group-item"><b>expiration date: </b>`+cert_obj.date_expiration+`</li>
                    <li class="list-group-item"><b>issuing authority: </b>`+cert_obj.issuing_authority+`</li>
                    <li class="list-group-item"><b>category: </b>`+cert_obj.category+`</li>
                  </ul>
                  <div class="card-body">
                    <a href="`+cert_obj.document+`" class="btn btn-info" target="_blank">Download</a>
                  </div>
                </div>
              `;
        }
        html_lastCertificates += `</div>`;
      }
      //...

      // display profile card
      mainContent.innerHTML = `
      <div class="container-fluid">
        <div class="row">
          <p>---<b> profile section </b>------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          <div class="card" style="width: 50rem;">
            <div class="card-body">
              <h5 class="card-title">Welcome back!</h5>
              <p class="card-text">
                We're glad to see you back on our system. <br>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><b>name: </b>`+account_name+`</li>
              <li class="list-group-item"><b>wallet address: </b>`+App.account+`</li>
              <li class="list-group-item"><b>role: </b>`+role+`</li>
            </ul>
          </div>
        </div>
        <div class="row">
          <p>--------------------------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          <p>---<b> notifications </b>------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          `+html_notification+`
        </div>
        <div class="row">
          <p>--------------------------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          <p>---<b> last updated certificates </b>------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          `+html_lastCertificates+`
        </div>
        <div class="row">
          <p>--------------------------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          <p>---<b> ask for support </b>------------------------------------------------------------------------------</p>
        </div>
        <div class="row">
          <div class="card" style="width: 50rem;">
            <div class="card-body">
              <h5 class="card-title">Contact us</h5>
              <p class="card-text">
                Please, refer to the following references to contact us. We are eager to hear your requests!
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><b>eros ribaga: </b>eros.ribaga@student.unitn.it</li>
              <li class="list-group-item"><b>stefano genetti: </b>stefano.genetti@student.unitn.it</li>
              <li class="list-group-item"><b>pietro fronza: </b>pietro.fronza@student.unitn.it</li>
            </ul>
          </div>
        </div>
        <div class="row">
          <p>--------------------------------------------------------------------------------------------------</p>
        </div>
      </div>
      `;

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
        </select><br>
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

    console.log("validate "+tokenId);

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