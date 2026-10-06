// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IAuthenTickNFT {
    function exists(uint256 tokenId) external view returns (bool);
    function isAuthentic(uint256 tokenId) external view returns (bool);
}

/**
 * @title OwnershipRegistry
 * @dev Anchors the coarse lifecycle of each token on-chain. Stages only move
 *      forward one step at a time and each step needs the matching role, so a
 *      retailer cannot skip distribution and a revoked product is frozen.
 *      Detailed EPCIS events stay off-chain.
 */
contract OwnershipRegistry {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    enum LifecycleStage {
        None,
        Minted,
        InDistribution,
        AtRetail,
        ConsumerOwned
    }

    IAccessControl public immutable roles;
    IAuthenTickNFT public immutable nft;
    mapping(uint256 => LifecycleStage) public stageOf;

    event StageChanged(
        uint256 indexed tokenId,
        LifecycleStage indexed fromStage,
        LifecycleStage indexed toStage,
        address actor
    );

    error UnknownProduct(uint256 tokenId);
    error ProductRevoked(uint256 tokenId);
    error InvalidTransition(LifecycleStage from, LifecycleStage to);
    error MissingRole(bytes32 role);

    constructor(IAccessControl roleManager, IAuthenTickNFT nft_) {
        roles = roleManager;
        nft = nft_;
    }

    function advance(uint256 tokenId) external returns (LifecycleStage next) {
        if (!nft.exists(tokenId)) revert UnknownProduct(tokenId);
        if (!nft.isAuthentic(tokenId)) revert ProductRevoked(tokenId);

        LifecycleStage prev = stageOf[tokenId];
        if (prev == LifecycleStage.ConsumerOwned) {
            revert InvalidTransition(prev, prev);
        }
        next = LifecycleStage(uint8(prev) + 1);

        bytes32 required = _roleFor(next);
        if (!roles.hasRole(required, msg.sender)) revert MissingRole(required);

        stageOf[tokenId] = next;
        emit StageChanged(tokenId, prev, next, msg.sender);
    }

    function _roleFor(LifecycleStage stage) private pure returns (bytes32) {
        if (stage == LifecycleStage.Minted) return MANUFACTURER_ROLE;
        if (stage == LifecycleStage.InDistribution) return DISTRIBUTOR_ROLE;
        return RETAILER_ROLE; // AtRetail and ConsumerOwned (point of sale)
    }
}
