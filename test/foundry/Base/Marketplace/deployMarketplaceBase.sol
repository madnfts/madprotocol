// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import { IMarketplace } from "test/foundry/Base/Marketplace/IMarketplace.sol";
import { ISwapRouter } from "contracts/lib/uniswap/ISwapRouter.sol";
import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";
import { MarketplaceFactory } from
    "test/foundry/Base/Marketplace/marketplaceFactory.sol";

contract DeployMarketplaceBase is Test, MarketplaceFactory {
    address marketplaceOwner = makeAddr("MarketplaceOwner");
    address recipientMarketplace = makeAddr("RecipientMarketplace");
    address paymentTokenAddressMarket = makeAddr("paymentTokenAddressMarket");
    address swapRouter = makeAddr("SwapRouter");
    address factoryVerifierMarketplace = makeAddr("MarketplaceFactory");

    address[] marketplaceDefaultAddresses =
        [recipientMarketplace, paymentTokenAddressMarket, swapRouter];

    function deployMarketplaceDefault(ercTypes _ercType)
        public
        returns (IMarketplace madMarketplace)
    {
        madMarketplace = deployMarketplaceCustom(
            _ercType,
            marketplaceOwner,
            recipientMarketplace,
            paymentTokenAddressMarket,
            swapRouter
        );
    }
    //

    function deployMarketplaceCustom(
        ercTypes _ercType,
        address _owner,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) public returns (IMarketplace madMarketplace) {
        vm.prank(_owner);
        madMarketplace = IMarketplace(
            createMarketplace(
                _ercType,
                _recipientMarketplace,
                _paymentTokenAddressMarket,
                _swapRouter
            )
        );
        // emit log_named_address("marketplaceAddress",
        // address(madMarketplace));
        // emit log_named_address("owner", _owner);
        // emit log_named_address("msg.sender", msg.sender);

        if (address(madMarketplace) != address(1)) {
            assertTrue(madMarketplace.owner() == _owner);
            assertTrue(madMarketplace.swapRouter() == _swapRouter);
            assertTrue(madMarketplace.recipient() == _recipientMarketplace);
            assertTrue(
                address(madMarketplace.erc20()) == _paymentTokenAddressMarket
            );
        } else {
            emit log_string("Deployment Failed");
        }
    }

    function setFactory(
        IMarketplace _marketplace,
        address _factoryAddress,
        address _owner
    ) public {
        FactoryVerifier _factoryVerifierMarketplace =
            FactoryVerifier(_factoryAddress);

        // Set Factory
        vm.expectRevert();
        _marketplace.setFactory(FactoryVerifier(address(0)));

        vm.prank(_owner);
        _marketplace.setFactory(_factoryVerifierMarketplace);
        assertTrue(_marketplace.MADFactory() == _factoryVerifierMarketplace);
    }
}
