const Certificate = artifacts.require("Certificate");
const Eagle = artifacts.require("Eagle");

module.exports = function(deployer){
    let eagleSmartContractInstance;

    deployer.deploy(Eagle).then((eagle_instance) => {
        eagleSmartContractInstance = eagle_instance;
        return deployer.deploy(Certificate, Eagle.address);
    }).then(()=>{
        return eagleSmartContractInstance.setCertificateAddress(Certificate.address);
    });
}