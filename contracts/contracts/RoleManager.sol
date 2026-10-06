// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleManager
 * @dev Single source of truth for supply-chain roles. AuthenTickNFT and
 *      OwnershipRegistry both defer to it, so granting or revoking a role here
 *      takes effect across the whole protocol.
 */
contract RoleManager is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    error AdminRequired();

    constructor(address admin) {
        if (admin == address(0)) revert AdminRequired();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
}
