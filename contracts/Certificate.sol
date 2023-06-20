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

    constructor() ERC721("Certificate", "CERT") {}

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

    //TODO: spostarla in Eagle.sol
    function getTokensOwnedByAnotherUser(address user) public view returns (uint256[] memory) {
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

    // TODO: spostarla in Eagle.sol
    function getTokensOwnedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _tokenIdCounter.current();
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i;
            if(!_exists(tokenId)) continue; // the token does not exist anymore //TODO: risolvere in altro modo
            if (ownerOf(tokenId) != msg.sender) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    //TODO: possibile spostarla in Eagle.sol? (Non credo)
    function deleteNFT(uint256 tokenId) public {
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

        // if the certificates has an expiration date
        // and it is expired, then set certificate
        // validity to false
        if (cert_obj.isNonExpiring) return true;
        uint256 currentTimestamp = block.timestamp;
        //  cert_obj.isValid = cert_obj.isValid && (cert_obj.exparationDate>currentTimestamp);  // TODO: riflettere come impostare il certificato not valid dopo un po' qui non posso modificare lo stato
        return (cert_obj.exparationDate>currentTimestamp);
    }

    function getExpirationDate(uint256 tokenId) public view returns (uint256){
        CertificateItem memory cert_obj = mintedCertificates[tokenId];
        return cert_obj.isNonExpiring ? 0 : cert_obj.exparationDate;
    }

    // set to false the validity of the certificate specified as
    // input parameter
    function setCertificateNotValid(uint256 tokenId) public{    // TODO: pensare cosa succede se il certificato con l'ID che viene passato non esiste
                                                                // TODO: renderla chiamabile solo dai certificati dei clienti
        CertificateItem storage cert_obj = mintedCertificates[tokenId];
        cert_obj.isValid = false;        
    }

    // set to true the validity of the certificate specified as
    // input parameter
    function setCertificateValid(uint256 tokenId) public{       // TODO: pensare cosa succede se il certificato con l'ID che viene passato non esiste
                                                                // TODO: renderla chiamabile solo dai certificati dei clienti
        CertificateItem storage cert_obj = mintedCertificates[tokenId];
        cert_obj.isValid = true;        
    }
}