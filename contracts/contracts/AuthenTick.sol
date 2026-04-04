// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuthenTick {

    struct Product {
        uint256 productId;
        string name;
        string manufacturer;
        address owner;
        bool exists;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;

    event ProductRegistered(uint256 productId, string name, string manufacturer, address owner);
    event OwnershipTransferred(uint256 productId, address oldOwner, address newOwner);

    // Register a new product
    function registerProduct(string memory _name, string memory _manufacturer) public {
        productCount++;
        products[productCount] = Product(productCount, _name, _manufacturer, msg.sender, true);
        emit ProductRegistered(productCount, _name, _manufacturer, msg.sender);
    }

    // Transfer product ownership
    function transferOwnership(uint256 _productId, address _newOwner) public {
        require(products[_productId].exists, "Product not found");
        require(products[_productId].owner == msg.sender, "Not owner");

        address oldOwner = products[_productId].owner;
        products[_productId].owner = _newOwner;

        emit OwnershipTransferred(_productId, oldOwner, _newOwner);
    }

    // Verify product details
    function verifyProduct(uint256 _productId) public view returns (Product memory) {
        require(products[_productId].exists, "Product not found");
        return products[_productId];
    }
}