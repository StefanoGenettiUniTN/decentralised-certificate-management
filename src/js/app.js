App = {
  web3Provider: null,
  account: null,
  contracts: {},
  blockchainid: -1,

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

          // clear error message section
          errorMsg.innerHTML = ``;
          
        })
        .catch((error) => {
          console.log(error, error.code);
          errorMsg.innerHTML = `
            <div class="alert alert-danger" role="alert" style="width: 20%">
              Unable to access wallet account.
            </div>`;
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

  getWalletFromId: async function(blockchain_id) {    
    var wallet = -1;
    let eagleContractInstance = await App.contracts.Eagle.deployed();     
    await eagleContractInstance.getUserWallet(blockchain_id).then(function (result) {
      wallet = result;
    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
    });

    return wallet;    
  },

   // Page: upload certificate
  // load the user interface
  displayUploadCertificateForm: async function(owner=undefined){
    if(App.account){
      mainContent.innerHTML = `
        <h1 class="display-4 mb-4">Upload a certificate</h1> 
        <div class="col-sm-6">
          <div class="input-group mb-3">
            <span class="input-group-text">Name</span>
            <input type="text" class="upload-form form-control" id="certificate-name" placeholder="Username" required>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Description</span>
            <textarea class="upload-form form-control" id="certificate-description" required></textarea>
          </div>
          <div class="input-group mb-3">
            <input class="upload-form form-control" type="file" id="file-input" accept="application/pdf" required>
          </div>
          <div class="input-group mb-3">
            <label class="input-group-text">Category</label>
            <select class="upload-form form-select" id="certificate-category" required>
              <option value="DFLT">DFLT</option>
              <option value="FRMZ">FRMZ</option>
              <option value="SECU">SECU</option>
              <option value="WELL">WELL</option>
              <option value="CURR">CURR</option>
              <option value="LANG">LANG</option>
            </select>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Achievement date</span>
            <input class="upload-form form-control" type="date" data-bs-date-format="yyyy-mm-dd" id="certificate-achievement" required>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Expiration date</span>
            <input class="upload-form form-control" type="date" data-bs-date-format="yyyy-mm-dd" id="certificate-expiration" required>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Issuing authority</span>
            <input type="text" class="upload-form form-control" id="certificate-authority" required>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Owner address</span>
            <input type="text" class="upload-form form-control" id="certificate-owner" placeholder="Owner" required>
          </div>
          <button type="button" class="btn btn-primary mb-4" onclick="App.uploadClick()" id="btn-upload">Upload</button>
          <br>
          <div id="upload-result" class="invisible alert" role="alert" style="width: 30rem;">
          </div> 
        </div>
      `;

      // Get id if owner not specified
      if(owner == undefined) {
        if(App.blockchainid==-1){
          let result = await App.setBlockchainId();  // check if the user is in the team
          if(result==-1){
            console.log("you are not part of the team");
            App.displayNotInTeam();
            return;
          }
          return;
        }

        owner = App.blockchainid
        
      }
     
      var wallet = await App.getWalletFromId(owner) 
      console.log(wallet)    
      $('#certificate-owner').val(wallet)
      

    }else{ // If wallet is not connected
      App.displayConnectMetamask();
    }
  },

  uploadClick: function() {    

    // Check if all required inputs field have been compiled
    var valid = true;
    var inputs = document.getElementsByClassName("upload-form");

    for (let i = inputs.length-1; i >= 0; i--) { //descending for to make validation start from the first input
      if (!inputs[i].reportValidity()) {
        valid = false;        
      }      
    }
    
    if(valid) {           
      //Get all the information
      const name = $('#certificate-name').val();
      const description = $('#certificate-description').val();
      const category = $('#certificate-category').val();
      const issuing_authority = $('#certificate-authority').val();
      const date_achievement = $('#certificate-achievement').val();
      const date_expiration = $('#certificate-expiration').val();  
      const owner = $('#certificate-owner').val();    
      
      // Get the file data
      const fileInput = $('#file-input')[0];
      const file = fileInput.files[0];     
      
      // Create a new FormData object
      const formData = new FormData();
      
      // Append the file to the FormData object        
      formData.append('file', file);
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('date_achievement', date_achievement)
      formData.append('date_expiration', date_expiration)
      formData.append('issuing_authority', issuing_authority)        

      // Send the file to the server
      fetch('../api/v1/add-certificate', {
        method: 'POST',
        body: formData
      })     
      .then(response => response.json()) 
      .then(async data => {
        // Handle the server response
        mint = await App.mintNFT(data.IpfsHash, date_expiration, owner);

        //show the result alert
        resultAlert = $("#upload-result");
        resultAlert.removeClass();
        resultAlert.addClass("alert")

        if(mint) {
          resultAlert.addClass("alert-success")
          resultAlert.text("The certificate has been uploaded")
        } else {
          resultAlert.addClass("alert-danger")
          resultAlert.text("An error occured while uploading the certificate")
        }
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
    }
  },

  // create new certificate
  mintNFT: async function(cert_uri, date_expiration, owner){
    
    let expiration_date_epoch = Math.floor(new Date(date_expiration).getTime() / 1000);
    //let unlimited_duration = $('#cert_noexpdate').is(':checked')
    let unlimited_duration = false;

    await App.contracts.Certificate.deployed().then(async function(instance){
      certificateInstance = instance;
      minted = true //return value, if no errors occur = true

      try {
        // Call the mintToken smart contract function to issue a new token
        // to the given address. This returns a transaction object, but the 
        // transaction hasn't been confirmed yet, so it doesn't have our token id.      
        const result = await certificateInstance.safeMintTo(cert_uri, expiration_date_epoch, unlimited_duration, owner, {from: App.account});

        // The OpenZeppelin base ERC721 contract emits a Transfer event 
        // when a token is issued.
        var event = certificateInstance.Transfer(function(error, response) {
          if (!error) {
              console.log(response.args.tokenId.toString());
          }else{
              console.log(error);
              minted = false;
          }
        });
      }catch(err){
        console.log("error:")
        console.log(err);
        minted = false;
      }
    }).catch(function(err){
      console.log("error:")
      console.log(err.message);
      minted = false;
    });

    return minted
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

  // display list of the available courses
  displayCourses: async function(){
    if(App.account){
      mainContent.innerHTML = `
      <div class="jumbotron">
        <h2 class="display-4">Courses</h2>
        <p class="lead">Here is the list of the courses which are available in your organization.</p>
        <p class="lead">
          <button type="button" class="btn btn-dark id="addCourseBtn" onclick="App.displayAddNewCourse()">Add course</button>
        </p>
        <hr class="my-4">
      </div>
      <div class="container-fluid">
        <p><b>Courses:</b></p>
        <div id="output_courses">
        </div>
      </div>
      <hr class="my-4">
      <div class="container-fluid">
        <p><b>Current subscriptions:</b></p>
        <div id="output_courses_sub">
        </div>
      </div>
      `;

      if(App.blockchainid==-1){
        let result = await App.setBlockchainId();  // check if the user is in the team
        if(result==-1){
          console.log("you are not part of the team");
          App.displayNotInTeam();
          return;
        }
      }
      App.getCourses(App.blockchainid);
    }else{
      App.displayConnectMetamask();
    }
  },

  // display the form to add a new course
  displayAddNewCourse: function(){
    if(App.account){
      mainContent.innerHTML = `
      <div class="jumbotron">
        <h2 class="display-4">Add new course</h2>
        <p class="lead">Fill the following form in order to create a new course.</p>
        <p class="lead">
          <button type="button" class="btn btn-link" onclick="App.displayCourses()">Go back to list of courses</button>
        </p>
        <hr class="my-4">
      </div>
      <div class="container-fluid">
        <div class="col-sm-6"> 
          <div class="input-group mb-3">
            <span class="input-group-text">Title</span>
            <input type="text" class="course-form form-control" id="course-title" placeholder="title" required>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Description</span>
            <textarea class="course-form form-control" id="course-description" placeholder="description" required></textarea>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Date</span>
            <input class="course-form form-control" type="date" data-bs-date-format="yyyy-mm-dd" id="course-date" required>
          </div>
          <button type="button" class="btn btn-primary mb-4" onclick="App.addCourseClick()" id="btn-add-course">Upload</button>
          <br>
          <div id="course-result" class="invisible alert" role="alert" style="width: 30rem;">
        </div>
      </div>
      `;
    }else{
      App.displayConnectMetamask();
    }
  },

  addCourseClick: function() {
    // Check if all required inputs field have been compiled
    var valid = true;
    var inputs = document.getElementsByClassName("course-form");

    for (let i = inputs.length-1; i >= 0; i--) { //descending for to make validation start from the first input
      if (!inputs[i].reportValidity()) {
        valid = false;        
      }      
    }
    
    if(valid) {
      // Get course info
      const title = $("#course-title").val();
      const description = $("#course-description").val();
      const date = $("#course-date").val();
      
      // Send requesto to the server
      fetch('/api/v1/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(
        { title: title,
          description: description,
          date: date,
        } ),
      })   
      .then(async data => {
        
        //show the result alert
        resultAlert = $("#course-result");
        resultAlert.removeClass();
        resultAlert.addClass("alert")

        if(data.status == 201) {
          resultAlert.addClass("alert-success")
          resultAlert.text("Course successfully created!")
        } else {
          resultAlert.addClass("alert-danger")
          resultAlert.text("Something wrong. Check your compilation.")
        }
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
    }      
    
  },
  
  // create the certificate for the partecipant
  courseCreateCertificate: function(course_id, blockchain_id, page){
    if(App.account){
      $("#createCertificateMsg").html(`
        <div class="alert alert-success my-2" role="alert">NFT certificate successfully created!</div>`
      );
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
  },

 /**===MODEL===*/
//Get all courses
getCourses: function(userId){
  const html_courses = document.getElementById('output_courses');
  const html_courses_sub = document.getElementById('output_courses_sub');
  var courses_text="";
  var courses_text_sub="";

  fetch('../api/v1/courses')
  .then((resp) => resp.json()) //transform data into JSON
  .then(function(data) {

      for (var i = 0; i < data.length; i++){ // iterate overe recived data and write the course
                                             // under courses or current subscription whether the
                                             // current user is subscribed or not
          var course = data[i];

          console.log(course);

          let title = course["title"];
          let description = course["description"];
          let self = course["self"];
          let date = course["date"].split('T')[0];
          let users = course["users"];
          let self_id = self.substring(self.lastIndexOf('/') + 1);

          if(users.includes(Number(userId))){ // user already subscribed to the course
            courses_text_sub += `
              <div class="card my-2" style="width: 30rem;">
                <div class="card-body">
                  <h5 class="card-title">`+title+`</h5>
                  <p class="card-text">`+description+`</p>
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><b>Date: </b>`+date+`</li>
                </ul>
                <div class="card-body" id="courseControl">
                  <button class="btn btn-secondary" onclick="App.courseRemovePartecipant('`+self_id+`', '`+App.blockchainid+`')">Unsubscribe</button>
                  <button class="btn btn-warning" onclick="App.displayEditCourse('`+self_id+`')">Edit</button>
                </div>
              </div>
            `;
          }else{  // user is not subscribed yet
            courses_text += `
              <div class="card my-2" style="width: 30rem;">
                <div class="card-body">
                  <h5 class="card-title">`+title+`</h5>
                  <p class="card-text">`+description+`</p>
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><b>Date: </b>`+date+`</li>
                </ul>
                <div class="card-body" id="courseControl">
                  <button class="btn btn-success" onclick="App.courseAddPartecipant('`+self_id+`', '`+App.blockchainid+`')">Subscribe</button>
                  <button class="btn btn-warning" onclick="App.displayEditCourse('`+self_id+`')">Edit</button>
                  <button class="btn btn-danger" onclick="App.deleteCourse('`+self_id+`')">Delete</button>
                </div>
              </div>
            `;
          }
      }
      html_courses.innerHTML += courses_text;
      html_courses_sub.innerHTML += courses_text_sub;
  })
  .catch( error => console.error(error) ); //catch dell'errore
},
//...

// Delete the selected course
deleteCourse: function(courseId){
  if(confirm("Are you sure to delete the selected course?")){
    fetch('../api/v1/courses/'+courseId, {
        method: 'DELETE',
    })
    .then((resp) => {
      if(resp.status==204){
        App.displayCourses();
      }else{
        console.log("error");
      }
    })
  }
},

// subscribe to input course
courseSubscribe: async function(course_id, blockchain_id){
  if(blockchain_id != -1){

    //console.log("course_id: "+course_id+" user_blockchain_id: "+user_blockchain_id);

    await fetch('../api/v1/registrations', {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json; charset=UTF-8'},
        body: JSON.stringify( { course_id: course_id, user_blockchain_id: blockchain_id} ),
    })
    .catch( error => console.error(error) ); //catch dell'errore
  }
},

// unsubscribe to input course
courseUnsubscribe: async function(course_id, blockchain_id){
  if(blockchain_id != -1){    

    //console.log("course_id: "+course_id+" user_blockchain_id: "+blockchain_id);

    await fetch('../api/v1/unsubscribe', {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json; charset=UTF-8'},
        body: JSON.stringify( { course_id: course_id, user_blockchain_id: blockchain_id } ),
    })
    .catch( error => console.error(error) ); //catch dell'errore
  }
},

// get the list of users subscribed to the input course
getSubscribedUsers: function(course_id){
  const html_subscribed_users = document.getElementById('editCoursePartecipants');
  var html_text="";

  fetch('../api/v1/courses/'+course_id+'/users')
  .then((resp) => resp.json()) //transform data into JSON
  .then(function(data) {
    console.log(data)
    for (var i = 0; i < data.length; i++){
      var subscriber = data[i];

      let name = subscriber["name"];
      let surname = subscriber["surname"];
      let course_self = subscriber["self"];
      let user_self = subscriber["user"];
      let user_self_id = user_self.substring(user_self.lastIndexOf('/') + 1);

      html_text += `
        <li class="list-group-item">
          <button type="button" class="btn btn-secondary" onclick="App.courseRemovePartecipant('`+course_id+`', '`+user_self_id+`', 'edit')">remove</button>
          <button type="button" class="btn btn-primary" onclick="App.displayUploadCertificateForm('`+user_self_id+`')">create certificate</button>
          <span>`+name+` `+surname+`</span>
          <span id="createCertificateMsg"></span>
        </li>
      `;
    }
    html_subscribed_users.innerHTML += html_text;
  })
  .catch( error => console.error(error) ); //catch dell'errore
},

getUnsubscribedUsers: function(course_id){
  const html_unsubscribed_users = document.getElementById('editCourseAdd');
  var html_text="";

  fetch('../api/v1/users')
  .then((resp) => resp.json()) //transform data into JSON
  .then(function(data) {
    console.log(data)
    for (var i = 0; i < data.length; i++){
      var subscriber = data[i];
      
      // Get user info
      let name = subscriber["name"];
      let surname = subscriber["surname"];
      let courses = subscriber["courses"]
      let user_self = subscriber["self"];
      let user_self_id = user_self.substring(user_self.lastIndexOf('/') + 1);

      // Check if user is subscribed to the course, if not add it to the list
      if(!courses || !courses.includes(course_id)) {
        html_text += `
        <li class="list-group-item">
          <button type="button" class="btn btn-info" onclick="App.courseAddPartecipant('`+course_id+`', '`+user_self_id+`', 'edit')">add</button>
          <span>`+name+` `+surname+`</span>
          <span id="createCertificateMsg"></span>
        </li>
      `;
      }      
    }
    html_unsubscribed_users.innerHTML += html_text;
  })
  .catch( error => console.error(error) ); //catch dell'errore
},

// remove course partecipant
courseRemovePartecipant: async function(course_id, blockchain_id, page=undefined){
  if(App.account){
    // Update the members subscribed to the course
    await App.courseUnsubscribe(course_id, blockchain_id)

    // Redirect to the right page
    if(page == "edit")
      App.displayEditCourse(course_id);
    else 
      App.displayCourses();
  }else{
    App.displayConnectMetamask();
  }
}, 

// add course partecipant
courseAddPartecipant: async function(course_id, blockchain_id, page=undefined){
  if(App.account){
    // Update the members subscribed to the course
    await App.courseSubscribe(course_id, blockchain_id)

    // Redirect to the right page
    if(page == "edit")
      App.displayEditCourse(course_id);
    else 
      App.displayCourses();
  }else{
    App.displayConnectMetamask();
  }
}, 
//...

/**===========*/

/**===VIEW===*/

// display error message if the user
// is not in the team yet
displayNotInTeam: function(){
  mainContent.innerHTML = `<p>Sorry, you are not in the team yet. Ask the team leader to register yourself.</p>`;
},

displayEditCourse: function(course_id){
  if(App.account){
    mainContent.innerHTML = `
    <div class="jumbotron">
      <h2 class="display-4">Edit course</h2>
      <p class="lead">In this section you can:</p>
      <ul>
        <li>add and remove course partecipants</li>
        <li>send certificate of partecipation</li>
      </ul>
      <p class="lead">
        <button type="button" class="btn btn-link" onclick="App.displayCourses()">Go back to list of courses</button>
      </p>
      <hr class="my-4">
    </div>
    <div class="container-fluid">
      <h4>TODO Corso aggiornamento meccanici</h4>
      <p>TODO <b>date:</b> 2020-02-19</p>
      <h6 class="mt-3">Partecipants:</h6>
      
      <ul class="list-group" style="width: 30rem;">
      <div id="editCoursePartecipants">
        <li class="list-group-item">
          <button type="button" class="btn btn-secondary" onclick="App.courseRemovePartecipant()">remove</button>
          <button type="button" class="btn btn-primary" onclick="App.courseCreateCertificate()">create certificate</button>  Beppino beppini
          <span id="createCertificateMsg"></span>
        </li>
      </div>
      </ul>
      <h6 class="mt-3">Add partecipant:</h6>
      <ul class="list-group" style="width: 30rem;">
      <div id="editCourseAdd">        
          <li class="list-group-item"><button type="button" class="btn btn-info" onclick="#">add</button>  Beppino beppini</li>
      </div>
      </ul>
    </div>
    `;

    App.getSubscribedUsers(course_id);
    App.getUnsubscribedUsers(course_id)
  }else{
    App.displayConnectMetamask();
  }
},

/**===========*/

/**===CONTROLLER===*/

// set blockchain id: each user in the system has an associated id stored in
// the blockchain. If the request does not complete successfully, then it
// means that the user is not part of the organization yet.
// If this is the case an alert is displayed and App.blockchainid is set
// to -1.
setBlockchainId: async function (){
  console.log("app set blockchainid");
  let result = await App.contracts.Eagle.deployed().then(async function(instance){
    EagleInstance = instance;
    try {
      let result = await EagleInstance.getMyUserId({from: App.account});
      App.blockchainid = result.toNumber();
    }catch(err){
      return -1;
    }
  }).catch(function(err){
    console.log("error:")
    console.log(err.message);
  });

  return result;
}

/**===========*/
};