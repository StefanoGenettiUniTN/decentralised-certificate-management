// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Eagle.sol";
import "../contracts/Certificate.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract TestEagle is IERC721Receiver{
    enum Role{ UNKNOWN, TEAM_LEADER, LEADER, SECRETARIAT, STANDARD}

    Eagle deployed_eagle = Eagle(DeployedAddresses.Eagle());                            // deployed Eagle smart contract
    Certificate deployed_certificate = Certificate(DeployedAddresses.Certificate());    // deployed Certificate smart contract
    Eagle public eagle;                                                                 // deploy a new Eagle smart contract for test purposes

    function beforeAll() public {
        eagle = new Eagle();
    }
    
    // mock user data
    address standard_user1 = 0x74F34b14C5674a23Bcd255dB23C6e95Ed0742fdd;
    uint256 area1 = 1;
    address secretary_user = 0x115c5FBcA866051e83217d9e4Fb81b40A33Bb041;

    // mock certificate data
    string mock_uri = "https://blue-intelligent-minnow-359.mypinata.cloud/ipfs/QmaTcDrwRo7SxcSCitzARLtBgCfnZcD6H5gqVdm33YH3XP";
    uint256 mock_expirationDate = 34096586764;
    bool mock_isNonExpiring = false;

    // test setCertificateAddress()
    function testSetCertificateAddress() public {
        address firstCertificateAddress = DeployedAddresses.Certificate();
        eagle.setCertificateAddress(firstCertificateAddress);

        address secondCertificateAddress = address(0x0987654321);
        (bool success, ) = address(eagle).call(
            abi.encodeWithSignature("setCertificateAddress(address)", secondCertificateAddress)
        );
        Assert.isFalse(success, "Certificate address should be already set.");
    }
    //...end test setCertificateAddress()

    // test first interaction

    // 1.1 at the beginning systemInitialized should return false
    function testFirtInteractionTrue() public{
        bool result = eagle.systemInitialized();
        Assert.equal(false, result, "At the beginning systemInitialized should return false.");
    }

    // 1.2 same but with the deployed smart contract
    function testFirtInteractionTrue_deployed() public{
        bool result = deployed_eagle.systemInitialized();
        Assert.equal(false, result, "At the beginning systemInitialized should return false.");
    }

    // 2.1 register the first team leader
    function testRegisterFirstTeamLeader() public{
        uint256 result = eagle.addFirstTeamLeader();
        Assert.equal(1, result, "The first user inserted in the system should have id equal to 1.");
    }

    // 2.2 same but with the deployed smart contract
    function testRegisterFirstTeamLeader_deployed() public{
        uint256 result = deployed_eagle.addFirstTeamLeader();
        Assert.equal(1, result, "The first user inserted in the system should have id equal to 1.");
    }

    // 3. now systemInitialized should be true
    function testFirtInteractionFalse() public{
        bool result = eagle.systemInitialized();
        Assert.equal(true, result, "Now systemInitialized should be true.");
    }

    //...end test first interaction

    // test addTeamMember()
    // 1. add standard user
    function testAddTeamMemberStandardUser() public {
        uint256 result = eagle.addTeamMember(standard_user1, 4, area1);
        Assert.equal(result, eagle.getUserId(standard_user1), "The id of the added user should be equal to getUserId(standard_user1)");
    }

    // 2. add secretary user
    function testAddTeamMemberSecretary() public {
        uint256 result = eagle.addTeamMember(secretary_user, 3, area1);
        Assert.equal(result, eagle.getUserId(secretary_user), "The id of the added user should be equal to getUserId(secretary_user)");
    }

    //...end test addTeamMember()

    // test getTeamMembers()
    function testGetTeamMembers() public{
        address[] memory teamMembers = eagle.getTeamMembers();
        Assert.equal(3, teamMembers.length, "At this point the team members should be 3.");
    }
    //...end test getTeamMembers

    // test getMemberRole
    // 1. test getMemberRole without parameters
    function testMemberRole() public{
        string memory userRole = eagle.getMyRole();
        Assert.equal("tl", userRole, "The wallet which deployed the Eagle smart contract should be 'tl'.");        
    }

    // 2. test getMemberRole with user address parameter
    function testUserRole() public{
        string memory userRole = eagle.getMemberRole(secretary_user);
        Assert.equal("sec", userRole, "The role of secretary_user should be a 'sec'");        
    }
    //...end test getMemberRole

    // test getUserId
    // 1. test getUserId without parameters
    function testGetUserId_1() public{
        uint256 userId = eagle.getMyUserId();
        Assert.equal(1, userId, "The blockchain id corresponding to the user which deployed the Eagle smart contract should be 1.");        
    }

    // 2. test getUserId with user address parameter
    function testGetUserId_2() public{
        uint256 userId = eagle.getUserId(standard_user1);
        Assert.equal(2, userId, "The role of standard_user1 should be a 2.");        
    }
    //...end test getUserId

    // test getUserWallet
    // 1. test getUserWallet without parameters
    function testGetUserWallet_1() public{
        address userAddress = eagle.getMyUserWallet();
        Assert.equal(address(this), userAddress, "The wallet address associated with the blockchain id of the eagle smart contract initiator should be equal to the wallet address of the eagle smart contract initiator.");        
    }

    // 2. test getUserWallet with user id parameter
    function testGetUserWallet_2() public{
        uint256 userIdStandardUser = eagle.getUserId(standard_user1);
        address userAddress = eagle.getUserWallet(userIdStandardUser);
        Assert.equal(standard_user1, userAddress, "The value of standard_user1 should be equal to eagle.getUserWallet(userIdStandardUser).");        
    }
    //...end test getUserWallet

    // test safeMint
    function testSafeMint_1() public{
        uint256 outputToken = deployed_certificate.safeMint(mock_uri, mock_expirationDate, mock_isNonExpiring);
        Assert.equal(outputToken, 0, "The first minted token should have tokenId=0.");        
    }

    function testSafeMint_2() public{
        uint256 outputToken = deployed_certificate.safeMintTo(mock_uri, mock_expirationDate, mock_isNonExpiring, standard_user1);
        Assert.equal(outputToken, 1, "The second minted token should have tokenId=1.");        
    }
    //...end test safeMint

    // test getTokensOwnedByMe
    function testGetTokensOwnedByMe() public{
        uint256[] memory outputTokenArray = deployed_certificate.getTokensOwnedByMe();
        Assert.equal(outputTokenArray[0], 0, "At this point the target user should have only one token with id=0.");
    }

    function testGetTokensOwnedByUser() public{
        uint256[] memory outputTokenArray = deployed_certificate.getTokensOwnedByUser(standard_user1);
        Assert.equal(outputTokenArray[0], 1, "At this point the target user should have only one token with id=0.");
    }
    //...end test getTokensOwnedByMe

    // test token uri
    function testTokenURI() public{
        string memory outputUri = deployed_certificate.tokenURI(0);
        Assert.equal(mock_uri, outputUri, "NFT uri of token 0 should be equal to mock_uri.");
    }
    //...end test token uri

    // test expiration date
    function testGetExpirationDate() public{
        uint256 outputExpirationDate = deployed_certificate.getExpirationDate(0);
        Assert.equal(mock_expirationDate, outputExpirationDate, "NFT expiration date of token 0 should be equal to mock_expirationDate.");
    }
    //...end test expiration date

    // test token validity
    // 1. tokenIsValid
    function testTokenIsValid() public{
        bool outputTokenIsValid = deployed_certificate.tokenIsValid(0);
        Assert.equal(true, outputTokenIsValid, "The minted NFT should be valid.");
    }

    // 2. set token as not valid
    // 3. check token validity. Should be not valid.
    function testTokenIsValid_1() public{
        deployed_eagle.setCertificateNotValid(0);
        bool outputTokenIsValid = deployed_certificate.tokenIsValid(0);
        Assert.equal(false, outputTokenIsValid, "The minted NFT should be valid.");
    }

    // 4. set token as valid
    // 5. check token validity. Should be valid.
    function testTokenIsValid_2() public{
        deployed_eagle.setCertificateValid(0);
        bool outputTokenIsValid = deployed_certificate.tokenIsValid(0);
        Assert.equal(true, outputTokenIsValid, "The minted NFT should be valid.");
    }
    //...end test token validity

    // test delete NFT
    function testDeleteNFT() public{
        deployed_certificate.deleteNFT(0);
        uint256[] memory outputTokenArray = deployed_certificate.getTokensOwnedByMe();
        Assert.equal(outputTokenArray.length, 0, "At this point the user should have zero NFT.");
    }
    //...end test delete NFT

    // the implementation of onERC721Received is required to test safeMint
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}