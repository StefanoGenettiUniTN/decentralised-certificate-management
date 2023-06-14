// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Certificate.sol";

contract Eagle {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateItemId;
    Counters.Counter private _userItemId;

    address private administrator;

    // team members
    mapping(address => uint256) private userAddressToUserId;
    mapping(uint256 => address) private userIdToUserAddress;

    constructor(){
        administrator = msg.sender;
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