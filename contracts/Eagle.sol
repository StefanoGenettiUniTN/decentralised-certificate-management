// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Certificate.sol";

contract Eagle {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateItemId;
    Counters.Counter private _userItemId;

    enum Role{ UNKNOWN, TEAM_LEADER, LEADER, SECRETARIAT, STANDARD}

    address private nftSmartContractAddress;

    // team members
    mapping(address => uint256) private userAddressToUserId;
    mapping(uint256 => address) private userIdToUserAddress;
    mapping(address => Role) private userAddressToRole;
    mapping(address => address) private userAddressToLeader;    // each standard team member belongs to an area with an associated leader
    mapping(uint256 => address) private areaIdToLeader;         // each area is identified by a numerical id and each area has an associated leader 

    constructor(){
        // the user who deploys the smart contract the first
        // time has team leader privileges. Hence, it can
        // potentially add a new team leader
        _userItemId.increment();
        uint256 userId = _userItemId.current();
        userAddressToUserId[msg.sender] = userId;
        userIdToUserAddress[userId]=msg.sender;

        userAddressToRole[msg.sender] = Role.TEAM_LEADER;
    }

    // when the smart contract of our customer is deployed
    // the address of the NFT smart contract is stored in
    // attribute nftSmartContractAddress
    function setCertificateAddress(address _certificateAddress) public {
        require(nftSmartContractAddress == address(0), "Certificate address already set");
        nftSmartContractAddress = _certificateAddress;
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

        userAddressToLeader[userWallet] = areaIdToLeader[area];

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
    function getMemberRole() public view returns (string memory){
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
    function getUserId() public view returns (uint256){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");    // the user must be already added in the team
        return userAddressToUserId[msg.sender];
    } 

    // Get user id of the input wallet
    function getUserId(address userWallet) public view returns (uint256){
        require(userAddressToUserId[userWallet]!=0, "invalid parameter");    // the input user must be already added in the team

        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    (userAddressToRole[msg.sender] == Role.LEADER && userAddressToLeader[userWallet]==msg.sender),
                    "Permission denied.");
        return userAddressToUserId[userWallet];
    }

    // Get user wallet of the sender
    function getUserWallet() public view returns (address){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");                             // the user must be already added in the team
        require(userIdToUserAddress[userAddressToUserId[msg.sender]]!=address(0), "invalid parameter");       // the input user must be already added in the team
        uint256 senderId = userAddressToUserId[msg.sender];       
        return userIdToUserAddress[senderId];
    } 

    // Get user wallet of the input id
    function getUserWallet(uint256 userId) public view returns (address){
        require(userIdToUserAddress[userId]!=address(0), "invalid parameter");    // the input user must be already added in the team

        require(    userAddressToRole[msg.sender] == Role.TEAM_LEADER ||
                    userAddressToRole[msg.sender] == Role.SECRETARIAT ||
                    (userAddressToRole[msg.sender] == Role.LEADER && userAddressToLeader[userIdToUserAddress[userId]]==msg.sender),
                    "Permission denied.");
        
        return userIdToUserAddress[userId];
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