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

        // emit log_named_address("factoryAddress", address(newFactory));
        // emit log_named_address("factoryOwner", _owner);
        // emit log_named_address("address(this)", address(this));

        verifyDeployment(
            newFactory,
            _owner,
            _marketplaceAddressFactory,
            _factorySignerAddress,
            _paymentTokenAddressFactory
        );
    }

    function verifyDeployment(
        IFactory newFactory,
        address _owner,
        address _marketplaceAddressFactory,
        address _factorySignerAddress,
        address _paymentTokenAddressFactory
    ) internal {
        if (address(newFactory) != address(1)) {
            // Check that newFactory's owner is the expected owner
            assertTrue(
                newFactory.owner() == _owner,
                "Owner should be the provided _owner"
            );

            // Check that newFactory's market address is as expected
            assertTrue(
                newFactory.market() == _marketplaceAddressFactory,
                "Market address should match the provided _marketplaceAddressFactory"
            );

            // Check that newFactory's signer address is as expected
            assertTrue(
                newFactory.signer() == _factorySignerAddress,
                "Signer address should match the provided _factorySignerAddress"
            );

            // Check that newFactory's ERC20 token address is as expected
            assertTrue(
                address(newFactory.erc20()) == _paymentTokenAddressFactory,
                "ERC20 token address should match the provided _paymentTokenAddressFactory"
            );

            // Check that colTypes for the given index returns empty bytes
            assertTrue(
                newFactory.colTypes(0).length == 0,
                "colTypes should return an empty bytes array"
            );


            // At this point, _owner is the only user that has interacted with
            // the contract.
            // Thus, check that userTokens for the _owner returns an empty
            // bytes32 array
            // assertTrue(
            //     newFactory.userTokens(_owner).length == 0,
            //     "userTokens should return an empty bytes32 array"
            // );
            // emit log_named_bytes32("userTokens", newFactory.userTokens(_owner));
            

            // Again, at this point, _owner is the only user that has interacted
            // with the contract.
            // Thus, check that getIDsLength for the _owner returns 0
            assertTrue(
                newFactory.getIDsLength(_owner) == 0,
                "getIDsLength should return 0"
            );
        } else {
            emit log_string("Deployment Failed");
        }
    }

    function setRouter(
        IFactory _factory,
        address _routerAddress,
        address _owner
    ) public {
        // Set Router
        // emit log_named_address("factoryRouterAddress", _routerAddress);

        vm.expectRevert();
        _factory.setRouter(address(0));

        vm.prank(_owner);
        _factory.setRouter(_routerAddress);
        assertEq(_factory.router(), _routerAddress);
    }
}
