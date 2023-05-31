// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";
import { FactoryFactory } from "test/foundry/Base/Factory/factoryFactory.sol";

contract DeployFactoryBase is Test, FactoryFactory {
    // Default Values for Factory Deploy tests
    address public factoryOwner = makeAddr("FactoryOwner");
    address public factorySigner = makeAddr("factorySigner");
    address public factoryRouterAddress = makeAddr("factoryRouterAddress");
    address public paymentTokenAddressFactory =
        makeAddr("paymentTokenAddressFactory");
    address public marketplaceAddressFactory =
        makeAddr("marketplaceAddressFactory");

    address[] factoryDefaultAddresses =
        [marketplaceAddressFactory, factorySigner, paymentTokenAddressFactory];

    function deployFactoryDefault(ercTypes ercType)
        public
        returns (IFactory newFactory)
    {
        newFactory = deployFactoryCustom(
            ercType,
            factoryOwner,
            marketplaceAddressFactory,
            factorySigner,
            paymentTokenAddressFactory
        );
    }

    function deployFactoryCustom(
        ercTypes ercType,
        address _owner,
        address _marketplaceAddressFactory,
        address _factorySignerAddress,
        address _paymentTokenAddressFactory
    ) public returns (IFactory newFactory) {
        vm.prank(_owner);

        address factoryAddress = createFactory(
            ercType,
            _marketplaceAddressFactory,
            _factorySignerAddress,
            _paymentTokenAddressFactory
        );

        newFactory = IFactory(factoryAddress);

        emit log_named_address("factoryAddress", address(newFactory));
        emit log_named_address("factoryOwner", _owner);
        emit log_named_address("address(this)", address(this));

        if (address(newFactory) != address(1)) {
            assertEq(newFactory.owner(), _owner);
            assertEq(newFactory.market(), _marketplaceAddressFactory);
            assertEq(newFactory.signer(), _factorySignerAddress);
            assertEq(address(newFactory.erc20()), _paymentTokenAddressFactory);
        }
    }

    function setRouter(
        IFactory _factory,
        address _routerAddress,
        address _owner
    ) public {
        // Set Router
        emit log_named_address("factoryRouterAddress", _routerAddress);

        vm.expectRevert();
        _factory.setRouter(address(0));

        vm.prank(_owner);
        _factory.setRouter(_routerAddress);
        assertEq(_factory.router(), _routerAddress);
    }
}
