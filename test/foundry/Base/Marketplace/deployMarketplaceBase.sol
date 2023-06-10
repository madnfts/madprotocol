// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IMarketplace } from
    "test/foundry/Base/Marketplace/interfaces/IMarketplace.sol";
import { ISwapRouter } from "contracts/lib/uniswap/ISwapRouter.sol";
import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";
import { MarketplaceFactory } from
    "test/foundry/Base/Marketplace/marketplaceFactory.sol";
import { MockERC20 } from "test/foundry/Base/Tokens/ERC20/deployMockERC20.sol";
import { AddressesHelp } from "test/foundry/utils/addressesHelp.sol";

contract DeployMarketplaceBase is MarketplaceFactory, AddressesHelp {
    address marketplaceOwner = makeAddr("MarketplaceOwner");
    address recipientMarketplace = makeAddr("RecipientMarketplace");
    address paymentTokenAddressMarket = makeAddr("paymentTokenAddressMarket");
    address swapRouter = makeAddr("SwapRouter");
    address factoryVerifierMarketplace = makeAddr("MarketplaceFactory");

    uint256 maxFees = 500;
    uint256 maxRoyaltyFee = 1500;
    uint16 basisPoints = 10_000;
    uint24 feeTier = 3000;
    uint256 maxFee = 250;
    uint256 maxOrderDuration = 31_536_000;
    uint256 minAuctionIncrement = 300;
    uint256 minAuctionIncrementMAX = 1200;
    uint256 minBidValue = 20;
    uint256 minOrderDuration = 300;
    uint256 minOrderDurationtMAX = 600;
    uint256 royaltyFee = 1000;

    address[] marketplaceDefaultAddresses =
        [recipientMarketplace, paymentTokenAddressMarket, swapRouter];

    function deployMarketplaceDefault(ercTypes _ercType)
        public
        returns (address marketplaceAddress)
    {
        marketplaceAddress = deployMarketplaceCustom(
            _ercType,
            marketplaceOwner,
            recipientMarketplace,
            paymentTokenAddressMarket,
            swapRouter
        );
    }
    //

    function _deployMarketplaceCustomInternal(
        ercTypes _ercType,
        address _owner,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) internal returns (address marketplaceAddress) {
        marketplaceAddress = deployMarketplaceCustom(
            _ercType,
            _owner,
            _recipientMarketplace,
            _paymentTokenAddressMarket,
            _swapRouter
        );
    }

    function deployMarketplaceCustom(
        ercTypes _ercType,
        address _owner,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) public returns (address marketplaceAddress) {
        vm.prank(_owner);
        IMarketplace madMarketplace = IMarketplace(
            createMarketplace(
                _ercType,
                _recipientMarketplace,
                _paymentTokenAddressMarket,
                _swapRouter
            )
        );

        marketplaceAddress = address(madMarketplace);
        // emit log_named_address("marketplaceAddress",
        // address(madMarketplace));
        // emit log_named_address("owner", _owner);
        // emit log_named_address("msg.sender", msg.sender);

        if (marketplaceAddress != address(1)) {
            verifyMarketplace(
                madMarketplace,
                _owner,
                _recipientMarketplace,
                _paymentTokenAddressMarket,
                _swapRouter
            );
        } else {
            emit log_string("Deployment Failed");
        }
    }

    function verifyMarketplace(
        IMarketplace _marketplace,
        address _owner,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) public {
        vm.startPrank(_owner);

        // Addresses
        assertTrue(_marketplace.owner() == _owner, "Incorrect owner");
        assertTrue(
            _marketplace.owner() != address(0), "Owner cannot be address(0)"
        );

        assertTrue(
            _marketplace.swapRouter() == _swapRouter, "Incorrect swap router"
        );
        assertTrue(
            _marketplace.swapRouter() != address(0),
            "Swap router cannot be address(0)"
        );

        assertTrue(
            _marketplace.recipient() == _recipientMarketplace,
            "Incorrect recipient"
        );
        assertTrue(
            _marketplace.recipient() != address(0),
            "Recipient marketplace cannot be address(0)"
        );

        assertTrue(
            address(_marketplace.erc20()) == _paymentTokenAddressMarket,
            "Incorrect payment token address"
        );
        assertTrue(
            address(_marketplace.erc20()) != address(0),
            "Payment token address cannot be address(0)"
        );
        setAndCheckAddress(_marketplace.setOwner, _marketplace.owner);
        setAndCheckAddress(_marketplace.setRecipient, _marketplace.recipient);

        // Fees
        assertTrue(
            _marketplace.MAX_FEES() == maxFees, "Incorrect MAX_FEES value"
        );
        assertTrue(
            _marketplace.MAX_ROYALTY_FEE() == maxRoyaltyFee,
            "Incorrect MAX_ROYALTY_FEE value"
        );
        assertTrue(
            _marketplace.basisPoints() == basisPoints,
            "Incorrect basisPoints value"
        );
        assertTrue(_marketplace.feeTier() == feeTier, "Incorrect feeTier value");
        assertTrue(_marketplace.maxFee() == maxFee, "Incorrect maxFee value");

        // Order
        assertTrue(
            _marketplace.maxOrderDuration() == maxOrderDuration,
            "Incorrect maxOrderDuration value"
        );
        assertTrue(
            _marketplace.minAuctionIncrement() == minAuctionIncrement,
            "Incorrect minAuctionIncrement value"
        );
        assertTrue(
            _marketplace.minAuctionIncrementMAX() == minAuctionIncrementMAX,
            "Incorrect minAuctionIncrementMAX value"
        );
        assertTrue(
            _marketplace.minBidValue() == minBidValue,
            "Incorrect minBidValue value"
        );
        assertTrue(
            _marketplace.minOrderDuration() == minOrderDuration,
            "Incorrect minOrderDuration value"
        );
        assertTrue(
            _marketplace.minOrderDurationtMAX() == minOrderDurationtMAX,
            "Incorrect minOrderDurationtMAX value"
        );
        assertTrue(
            _marketplace.royaltyFee() == royaltyFee,
            "Incorrect royaltyFee value"
        );

        // Verify mappings
        assertTrue(
            _marketplace.totalOutbid() == 0, "Incorrect totalOutbid value"
        );

        // TODO: add in higher level
        // Verify contract initialization
        // assertTrue(
        //     MockERC20(_paymentTokenAddressMarket).allowance(
        //         address(_marketplace), _swapRouter
        //     ) == type(uint256).max,
        //     "Invalid payment token allowance"
        // );

        // setAndCheckAddress(
        //     _marketplace.setFactory, _marketplace.MADFactory
        // );
        vm.stopPrank();
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
