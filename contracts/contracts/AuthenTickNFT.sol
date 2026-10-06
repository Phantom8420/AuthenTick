// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title AuthenTickNFT
 * @dev Digital twin (ERC-721) for a physical product. The token id is derived
 *      from (gtin, serial), so a serialized item can only ever be minted once.
 */
contract AuthenTickNFT is ERC721 {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

    struct ProductMetadata {
        string gtin;
        string serial;
        uint256 batchId;
        uint256 createdAt;
        address manufacturer;
        bool isVerified;
    }

    IAccessControl public immutable roles;
    mapping(uint256 => ProductMetadata) private _products;

    event ProductMinted(uint256 indexed tokenId, string gtin, string serial, address indexed manufacturer);
    event ProductRevoked(uint256 indexed tokenId, address indexed by, string reason);

    error NotManufacturer();
    error NotAuthorized();
    error AlreadyMinted(uint256 tokenId);
    error UnknownProduct(uint256 tokenId);
    error InvalidInput();

    constructor(IAccessControl roleManager) ERC721("AuthenTick Product", "ATK") {
        roles = roleManager;
    }

    /// Token id for a serialized item. abi.encode keeps ("1","23") and ("12","3") apart.
    function tokenIdFor(string memory gtin, string memory serial) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(gtin, serial)));
    }

    function mintProduct(
        address to,
        string calldata gtin,
        string calldata serial,
        uint256 batchId
    ) external returns (uint256 tokenId) {
        if (!roles.hasRole(MANUFACTURER_ROLE, msg.sender)) revert NotManufacturer();
        if (bytes(gtin).length != 14 || bytes(serial).length == 0) revert InvalidInput();

        tokenId = tokenIdFor(gtin, serial);
        if (_ownerOf(tokenId) != address(0)) revert AlreadyMinted(tokenId);

        _products[tokenId] = ProductMetadata({
            gtin: gtin,
            serial: serial,
            batchId: batchId,
            createdAt: block.timestamp,
            manufacturer: msg.sender,
            isVerified: true
        });
        _safeMint(to, tokenId);
        emit ProductMinted(tokenId, gtin, serial, msg.sender);
    }

    /// Flag a product as no longer authentic (recall, theft, cloned serial). Irreversible.
    function revokeProduct(uint256 tokenId, string calldata reason) external {
        ProductMetadata storage p = _products[tokenId];
        if (p.createdAt == 0) revert UnknownProduct(tokenId);
        bool isAdmin = roles.hasRole(0x00, msg.sender);
        if (msg.sender != p.manufacturer && !isAdmin) revert NotAuthorized();
        p.isVerified = false;
        emit ProductRevoked(tokenId, msg.sender, reason);
    }

    function getProduct(uint256 tokenId) public view returns (ProductMetadata memory) {
        if (_products[tokenId].createdAt == 0) revert UnknownProduct(tokenId);
        return _products[tokenId];
    }

    function isAuthentic(uint256 tokenId) public view returns (bool) {
        return _products[tokenId].isVerified;
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
