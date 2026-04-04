// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleManager
 * @dev Central RBAC for supply-chain actors (mirrors architecture doc).
 *      On-chain NFT contract may use its own AccessControl; this registry supports
 *      backend/off-chain authorization and future cross-contract checks.
 */
contract RoleManager is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    event RoleGrantedIndexed(bytes32 indexed role, address indexed account, address indexed sender);

    constructor(address admin) {
        require(admin != address(0), "admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function grantManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, account);
        emit RoleGrantedIndexed(MANUFACTURER_ROLE, account, msg.sender);
    }

    function grantDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
        emit RoleGrantedIndexed(DISTRIBUTOR_ROLE, account, msg.sender);
    }

    function grantRetailer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, account);
        emit RoleGrantedIndexed(RETAILER_ROLE, account, msg.sender);
    }

    function grantCustomer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CUSTOMER_ROLE, account);
        emit RoleGrantedIndexed(CUSTOMER_ROLE, account, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
