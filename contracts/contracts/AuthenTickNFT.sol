// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AuthenTickNFT
 * @dev Digital twin (ERC-721) for physical products with GS1-oriented metadata.
 */
contract AuthenTickNFT is ERC721, AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    struct ProductMetadata {
        string gtin;
        string serial;
        uint256 batchId;
        uint256 createdAt;
        bool isVerified;
    }

    mapping(uint256 => ProductMetadata) public products;
    mapping(string => bool) private _usedSerials;

    event ProductMinted(uint256 indexed tokenId, string gtin, string serial);

    constructor() ERC721("AuthenTick Product", "ATK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintProduct(
        address to,
        string memory gtin,
        string memory serial,
        uint256 batchId
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        string memory serialKey = string(abi.encodePacked(gtin, serial));
        require(!_usedSerials[serialKey], "Serial already exists");

        uint256 tokenId = uint256(keccak256(abi.encodePacked(serialKey)));
        require(_ownerOf(tokenId) == address(0), "Token id collision");
        _safeMint(to, tokenId);

        products[tokenId] = ProductMetadata({
            gtin: gtin,
            serial: serial,
            batchId: batchId,
            createdAt: block.timestamp,
            isVerified: true
        });

        _usedSerials[serialKey] = true;
        emit ProductMinted(tokenId, gtin, serial);
        return tokenId;
    }

    function getProduct(uint256 tokenId) public view returns (ProductMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        return products[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
