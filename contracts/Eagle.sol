// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Certificate.sol";

contract Eagle {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateItemId;
    Counters.Counter private _userItemId;

    bool private team_leader_init;  // once the smart contract is deployed team_leader_init=false.
                                    // When the team leader is initialized, team_leader_init is set to true.

    enum Role{ UNKNOWN, TEAM_LEADER, LEADER, SECRETARIAT, STANDARD}

    /**=============EVENTS=============*/

    // this event is emitted when the Certificate smart contract address is initialized
    event SetCertificateSmartContractAddress(address certificateSmartContractAddress);

    /**================================*/

    address private nftSmartContractAddress;

    // team members
    mapping(address => uint256) private userAddressToUserId;
    mapping(uint256 => address) private userIdToUserAddress;
    mapping(address => Role) private userAddressToRole;
    mapping(address => uint256) private userAddressToArea;      // each team member belongs to an area
    mapping(uint256 => address) private areaIdToLeader;         // each area is identified by a numerical id and each area has an associated leader 

    constructor(){
        team_leader_init=false;
    }

    // when the smart contract of our customer is deployed
    // the address of the NFT smart contract is stored in
    // attribute nftSmartContractAddress (see migrations/1_deployment.js)
    function setCertificateAddress(address _certificateAddress) public {
        require(nftSmartContractAddress == address(0), "Certificate address already set");
        nftSmartContractAddress = _certificateAddress;
        emit SetCertificateSmartContractAddress(nftSmartContractAddress);
    }

    // Check whether the first team leader has been
    // already registered or not
    function systemInitialized() public view returns (bool){
        return team_leader_init;
    }
    
    // Add team leader first time
    function addFirstTeamLeader() public returns (uint256){
        require(team_leader_init==false, "This function can only be called once.");
        _userItemId.increment();
        uint256 userId = _userItemId.current();
        userAddressToUserId[msg.sender] = userId;
        userIdToUserAddress[userId] = msg.sender;
        userAddressToArea[msg.sender] = 1;
        userAddressToRole[msg.sender] = Role.TEAM_LEADER;

        team_leader_init = true;

        return userId;
    }

    // Add a team member
    function addTeamMember(address userWallet, int userRole, uint256 area) public returns (uint256){
        require(    Role(userRole)==Role.TEAM_LEADER ||
                    Role(userRole)==Role.LEADER ||
                    Role(userRole)==Role.SECRETARIAT ||
                    Role(userRole)==Role.STANDARD,
                    "Role not valid." );
        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||    // team leader che add every kind of user
                    (userAddressToRole[msg.sender] == Role.SECRETARIAT && Role(userRole) != Role.TEAM_LEADER) ||    // team leader collaborators can't add a new team leader
                    (userAddressToRole[msg.sender] == Role.LEADER && Role(userRole) == Role.STANDARD && msg.sender==areaIdToLeader[area]),  // leaders can add only standard team members who belong to their area
                    "Permission denied.");

        if(userAddressToUserId[userWallet]!=0){ //the user has been already inserted into the system
            return userAddressToUserId[userWallet];
        }
        _userItemId.increment();
        uint256 userId = _userItemId.current();
        userAddressToUserId[userWallet] = userId;
        userIdToUserAddress[userId]=userWallet;

        userAddressToRole[userWallet] = Role(userRole);

        if(Role(userRole) == Role.LEADER){  // if we are adding a leader, we can set the leader of the corresponding area
            areaIdToLeader[area] = userWallet;
        }

        userAddressToArea[userWallet] = area;

        return userId;
    }

    // Get team members
    function getTeamMembers() public view returns (address[] memory){
        uint256 numberOfExistingUsers = _userItemId.current();
        address[] memory teamMemberAddress = new address[](numberOfExistingUsers);
        
        uint256 currentIndex = 1;
        for (uint256 i = 0; i < numberOfExistingUsers; i++) {
            address userAddress = userIdToUserAddress[currentIndex];
            teamMemberAddress[i] = userAddress;
            currentIndex += 1;
        }

        return teamMemberAddress;
    }

    // Get sender role
    function getMyRole() public view returns (string memory){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");    // the user must be already added in the team
        Role userRole = userAddressToRole[msg.sender];
        if (Role.TEAM_LEADER == userRole) return "tl";
        if (Role.STANDARD == userRole) return "std";
        if (Role.SECRETARIAT == userRole) return "sec";
        if (Role.LEADER == userRole) return "ct";
        return "unknown";
    }

    // Get specific member role
    function getMemberRole(address userWallet) public view returns (string memory){
        require(userAddressToUserId[userWallet]!=0, "invalid parameter");    // the input user must be already added in the team
        Role userRole = userAddressToRole[userWallet];
        if (Role.TEAM_LEADER == userRole) return "tl";
        if (Role.STANDARD == userRole) return "std";
        if (Role.SECRETARIAT == userRole) return "sec";
        if (Role.LEADER == userRole) return "ct";
        return "unknown";
    }

    // Get user id of the sender
    function getMyUserId() public view returns (uint256){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");    // the user must be already added in the team
        return userAddressToUserId[msg.sender];
    } 

    // Get user id of the input wallet
    function getUserId(address userWallet) public view returns (uint256){
        require(userAddressToUserId[userWallet]!=0, "invalid parameter");    // the input user must be already added in the team

        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    (userAddressToRole[msg.sender] == Role.LEADER && areaIdToLeader[userAddressToArea[userWallet]]==msg.sender),
                    "Permission denied.");
        return userAddressToUserId[userWallet];
    }

    // Get user wallet of the sender
    function getMyUserWallet() public view returns (address){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");   // the user must be already added in the team
        uint256 senderId = userAddressToUserId[msg.sender];       
        return userIdToUserAddress[senderId];
    } 

    // Get user wallet of the input id
    function getUserWallet(uint256 userId) public view returns (address){
        require(userIdToUserAddress[userId]!=address(0), "invalid parameter");    // the input user must be already added in the team

        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    (userAddressToRole[msg.sender] == Role.LEADER && areaIdToLeader[userAddressToArea[userIdToUserAddress[userId]]]==msg.sender),
                    "Permission denied.");
        
        return userIdToUserAddress[userId];
    } 

    // Get user id of the sender
    function getMyAreaId() public view returns (uint256){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");    // the user must be already added in the team
        return userAddressToArea[msg.sender];
    } 

    // Set the certificate of a team member not
    // valid
    function setCertificateNotValid(uint256 tokenId) public{
        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    userAddressToRole[msg.sender] == Role.LEADER,
                    "Permission denied.");
        Certificate(nftSmartContractAddress).setCertificateNotValid(tokenId);
    }

    // Set the certificate of a team member
    // as valid
    function setCertificateValid(uint256 tokenId) public{
        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    userAddressToRole[msg.sender] == Role.LEADER,
                    "Permission denied.");
        Certificate(nftSmartContractAddress).setCertificateValid(tokenId);
    }
}