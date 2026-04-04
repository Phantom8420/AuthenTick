// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title OwnershipRegistry
 * @dev Records high-level lifecycle stage per token (Mint -> distribution -> retail -> consumer).
 *      Detailed EPCIS events remain off-chain (e.g. MongoDB); this anchors critical transitions.
 */
contract OwnershipRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    enum LifecycleStage {
        None,
        Minted,
        InDistribution,
        AtRetail,
        ConsumerOwned
    }

    mapping(uint256 => LifecycleStage) public stageOf;

    event StageChanged(
        uint256 indexed tokenId,
        LifecycleStage indexed fromStage,
        LifecycleStage indexed toStage,
        address actor
    );

    constructor(address admin) {
        require(admin != address(0), "admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    function setStage(uint256 tokenId, LifecycleStage newStage) external onlyRole(REGISTRAR_ROLE) {
        LifecycleStage prev = stageOf[tokenId];
        stageOf[tokenId] = newStage;
        emit StageChanged(tokenId, prev, newStage, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
