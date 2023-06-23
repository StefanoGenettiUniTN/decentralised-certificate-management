// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Certificate is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address private eagleAddress;   // TODO: creare smart contract astratto

    // struct representing certificate information
    struct CertificateItem {
        uint256 creationDate;       // timestamp which indicates when the certificate has been created
        uint256 exparationDate;     // timestamp which indicates when the certificate will e no longer valid
        bool isNonExpiring;         // isNonExpiring=true -> the certificate has not an exparation Date
        address creator;            // address of the creator of the nft
        bool isValid;               // default: true -> mark the validity of the certificate
    }

    // mapping tokenId -> CertificateItem
    mapping(uint256 => CertificateItem) private mintedCertificates;

    /**=============EVENTS=============*/

    // this event is emitted when a NFT is minted
    event TokenMinted(uint256 indexed tokenId, string tokenURI);

    // this event is emitted when a certificate is added to mintedCertificates map
    event CertificateItemCreated(
        uint256 creationDate,
        uint256 exparationDate,
        bool isNonExpiring,
        address creator,
        bool isValid
    );
    /**================================*/

    constructor(address _eagleAddress) ERC721("Certificate", "CERT") {
        eagleAddress = _eagleAddress;
    }

    function safeMint(
                string memory uri,
                uint256 _exparationDate,
                bool _isNonExpiring
            ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        uint256 creationDate = block.timestamp;
        bool _isValid = true;
        bool isNonExpiring = _isNonExpiring;
        uint256 exparationDate = (isNonExpiring) ? 0 : _exparationDate;
        address creator = msg.sender;

        mintedCertificates[tokenId] = CertificateItem(
            creationDate,
            exparationDate,
            isNonExpiring,
            creator,
            _isValid
        );

        emit CertificateItemCreated(
            creationDate,
            exparationDate,
            isNonExpiring,
            creator,
            _isValid
        );

        emit TokenMinted(tokenId, uri);
        return tokenId;
    }

    function safeMintTo(
                string memory uri,
                uint256 _exparationDate,
                bool _isNonExpiring, 
                address owner
            ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, uri);

        uint256 creationDate = block.timestamp;
        bool _isValid = true;
        bool isNonExpiring = _isNonExpiring;
        uint256 exparationDate = (isNonExpiring) ? 0 : _exparationDate;
        address creator = msg.sender;

        mintedCertificates[tokenId] = CertificateItem(
            creationDate,
            exparationDate,
            isNonExpiring,
            creator,
            _isValid
        );

        emit CertificateItemCreated(
            creationDate,
            exparationDate,
            isNonExpiring,
            creator,
            _isValid
        );

        emit TokenMinted(tokenId, uri);
        return tokenId;
    }

    function getTokensOwnedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _tokenIdCounter.current();
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i;
            if(!_exists(tokenId)) continue; // the token does not exist anymore
            if (ownerOf(tokenId) != msg.sender) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }
    
    function getTokensOwnedByUser(address user) public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _tokenIdCounter.current();
        uint256 numberOfTokensOwned = balanceOf(user);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i;
            if(!_exists(tokenId)) continue; // the token does not exist anymore //TODO: risolvere in altro modo
            if (ownerOf(tokenId) != user) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function deleteNFT(uint256 tokenId) public{
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // check token validity given token id
    function tokenIsValid(uint256 tokenId) public view returns (bool) {
        CertificateItem storage cert_obj = mintedCertificates[tokenId]; // assign reference

        // the token is not valid
        if (cert_obj.isValid==false) return false;

        // check expiration date
        if (cert_obj.isNonExpiring) return true;

        uint256 currentTimestamp = block.timestamp;
        return (cert_obj.exparationDate>currentTimestamp);
    }

    function getExpirationDate(uint256 tokenId) public view returns (uint256){
        CertificateItem memory cert_obj = mintedCertificates[tokenId];
        return cert_obj.isNonExpiring ? 0 : cert_obj.exparationDate;
    }

    function getCreationDate(uint256 tokenId) public view returns (uint256){
        CertificateItem memory cert_obj = mintedCertificates[tokenId];
        return cert_obj.creationDate;
    }

    // set to false the validity of the certificate specified as
    // input parameter
    function setCertificateNotValid(uint256 tokenId) public{
        require(msg.sender == eagleAddress, "No permission.");
        require(mintedCertificates[tokenId].creationDate != 0, "Certificate does not exist");
        CertificateItem storage cert_obj = mintedCertificates[tokenId];
        cert_obj.isValid = false;        
    }

    // set to true the validity of the certificate specified as
    // input parameter
    function setCertificateValid(uint256 tokenId) public{
        require(msg.sender == eagleAddress, "No permission.");
        require(mintedCertificates[tokenId].creationDate != 0, "Certificate does not exist");
        CertificateItem storage cert_obj = mintedCertificates[tokenId];
        cert_obj.isValid = true;        
    }
}