// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Certificate.sol";

contract Eagle {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateItemId;
    Counters.Counter private _userItemId;

    enum Role{ UNKNOWN, TEAM_LEADER, STANDARD}

    address private administrator;

    address private nftSmartContractAddress;

    // team members
    mapping(address => uint256) private userAddressToUserId;
    mapping(uint256 => address) private userIdToUserAddress;
    mapping(address => Role) private userAddressToRole;

    constructor(){
        administrator = msg.sender;
    }

    // when the smart contract of our customer is deployed
    // the address of the NFT smart contract is stored in
    // attribute nftSmartContractAddress
    function setCertificateAddress(address _certificateAddress) public {
        require(nftSmartContractAddress == address(0), "Certificate address already set");
        nftSmartContractAddress = _certificateAddress;
    }

    // Add a team member
    function addTeamMember(address userWallet, int userRole) public returns (uint256){
        if(userAddressToUserId[userWallet]!=0){ //the user has been already inserted into the system
            return userAddressToUserId[userWallet];
        }
        _userItemId.increment();
        uint256 userId = _userItemId.current();
        userAddressToUserId[userWallet] = userId;
        userIdToUserAddress[userId]=userWallet;
        userAddressToRole[userWallet] = Role(userRole);
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

    // Get specific member role
    function getMemberRole(address userWallet) public view returns (string memory){
        Role userRole = userAddressToRole[userWallet];
        if (Role.TEAM_LEADER == userRole) return "tl";
        if (Role.STANDARD == userRole) return "std";
        return "unknown";   // TODO require userAddressToRole settato per potere eseguire. Questo TODO è possibile solo quando sapremo come configurare il tl la prima volta
    }

    // Get user id of the sender
    function getMyUserId() public view returns (uint256){
        require(userAddressToUserId[msg.sender]!=0, "you are not a team member");    // the user must be already added in the team
        return userAddressToUserId[msg.sender];
    } 

    // Get user id of the input wallet
    // TODO: this invocation must be used only by the team leader
    function getUserId(address userWallet) public view returns (uint256){
        require(userAddressToUserId[userWallet]!=0, "you are not a team member");    // the user must be already added in the team
        return userAddressToUserId[userWallet];
    }

    // Get user wallet of the input id
    // TODO: this invocation must be used only by the team leader
    function getUserWallet(uint256 userId) public view returns (address){
        require(userIdToUserAddress[userId]!=address(0), "you are not a team member");    // the user must be already added in the team
        return userIdToUserAddress[userId];
    } 

    // Set the certificate of a team member not
    // valid
    // TODO: this invocation must be used only by the team leader
    function setCertificateNotValid(uint256 tokenId) public{
        Certificate(nftSmartContractAddress).setCertificateNotValid(tokenId);
    }

    // Set the certificate of a team member
    // as valid
    // TODO: this invocation must be used only by the team leader
    function setCertificateValid(uint256 tokenId) public{
        Certificate(nftSmartContractAddress).setCertificateValid(tokenId);
    }
}