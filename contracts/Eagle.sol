// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Certificate.sol";

contract Eagle {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateItemId;
    Counters.Counter private _userItemId;

    enum Role{ TEAM_LEADER, STANDARD}

    address private administrator;    

    //key: certificate id
    //value: certificate object
    mapping(uint256 => CertificateItem) private certificateItemIdToCertificateItem;

    mapping(address => uint256) private userAddressToUserId;
    mapping(uint256 => address) private userIdToUserAddress;
    mapping(address => Role) private userAddressToRole;

    // struct representing a certificate
    struct CertificateItem {
        uint256 certificateItemId;  // id of the certificate
        address nftContractAddress; // address of the nft smart contract
        uint256 tokenId;            // id of the nft
        address creator;            // address of the creator of the nft
        address owner;              // address of the owner of the nft
    }

    // this event is emitted when a certificate is created
    event CertificateItemCreated(
        uint256 certificateItemId,
        address nftContractAddress,
        uint256 tokenId,
        address creator,
        address owner
    );

    constructor(){
        administrator = msg.sender;
    }

    // Create a new certificate
    function addCertificateItem(
        address nftContractAddress,
        uint256 tokenId
    ) public returns (uint256) {
        _certificateItemId.increment();
        uint256 certificateItemId = _certificateItemId.current();

        address creator = msg.sender;
        address owner = Certificate(nftContractAddress).ownerOf(tokenId);

        certificateItemIdToCertificateItem[certificateItemId] = CertificateItem(
            certificateItemId,
            nftContractAddress,
            tokenId,
            creator,
            owner
        );

        emit CertificateItemCreated(
            certificateItemId,
            nftContractAddress,
            tokenId,
            creator,
            owner
        );

        return certificateItemId;
    }

    // Add a team member
    function addTeamMember(address userWallet) public returns (uint256){
        if(userAddressToUserId[userWallet]!=0){ //the user has been already inserted into the system
            return userAddressToUserId[userWallet];
        }
        _userItemId.increment();
        uint256 userId = _userItemId.current();
        userAddressToUserId[userWallet] = userId;
        userIdToUserAddress[userId]=userWallet;
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

}