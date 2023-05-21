// // SPDX-License-Identifier: AGPL-3.0-only

// pragma solidity 0.8.19;

// import {MAD} from "contracts\MAD.sol";
// import {static_analysis} from "contracts\static_analysis.sol";
// import {MADFactory1155} from "contracts\Factory\MADFactory1155.sol";
// import {MADFactory721} from "contracts\Factory\MADFactory721.sol";
// import {MADFactoryBase} from "contracts\Factory\MADFactoryBase.sol";
// import {FactoryVerifier} from "contracts\lib\auth\FactoryVerifier.sol";
// import {Owned} from "contracts\lib\auth\Owned.sol";
// import {TwoFactor} from "contracts\lib\auth\TwoFactor.sol";
// import {DCPrevent} from "contracts\lib\security\DCPrevent.sol";
// import {ReentrancyGuard} from "contracts\lib\security\ReentrancyGuard.sol";
// import {SplitterEventsAndErrors} from "contracts\lib\splitter\SplitterEventsAndErrors.sol";
// import {SplitterImpl} from "contracts\lib\splitter\SplitterImpl.sol";
// import {ERC20} from "contracts\lib\tokens\ERC20.sol";
// import {ERC2981} from "contracts\lib\tokens\common\ERC2981.sol";
// import {FeeOracle} from "contracts\lib\tokens\common\FeeOracle.sol";
// import {ERC1155} from "contracts\lib\tokens\ERC1155\Base\ERC1155.sol";
// import {IERC1155} from "contracts\lib\tokens\ERC1155\Base\interfaces\IERC1155.sol";
// import {ERC1155Holder} from "contracts\lib\tokens\ERC1155\Base\utils\ERC1155Holder.sol";
// import {ERC721} from "contracts\lib\tokens\ERC721\Base\ERC721.sol";
// import {IERC721} from "contracts\lib\tokens\ERC721\Base\interfaces\IERC721.sol";
// import {ERC721Holder} from "contracts\lib\tokens\ERC721\Base\utils\ERC721Holder.sol";
// import {ISwapRouter} from "contracts\lib\uniswap\ISwapRouter.sol";
// import {IUniswapV3SwapCallback} from "contracts\lib\uniswap\IUniswapV3SwapCallback.sol";
// import {CREATE3} from "contracts\lib\utils\CREATE3.sol";
// import {SafeTransferLib} from "contracts\lib\utils\SafeTransferLib.sol";
// import {SplitterBufferLib} from "contracts\lib\utils\SplitterBufferLib.sol";
// import {Strings} from "contracts\lib\utils\Strings.sol";
// import {ImplBase} from "contracts\MADTokens\common\ImplBase.sol";
// import {PaymentManager} from "contracts\MADTokens\common\PaymentManager.sol";
// import {ImplBaseEventsAndErrors} from "contracts\MADTokens\common\interfaces\ImplBaseEventsAndErrors.sol";
// import {ERC1155Basic} from "contracts\MADTokens\ERC1155\ERC1155Basic.sol";
// import {ERC721Basic} from "contracts\MADTokens\ERC721\ERC721Basic.sol";
// import {MADMarketplace1155} from "contracts\Marketplace\MADMarketplace1155.sol";
// import {MADMarketplace721} from "contracts\Marketplace\MADMarketplace721.sol";
// import {MADMarketplaceBase} from "contracts\Marketplace\MADMarketplaceBase.sol";
// import {MADRouter1155} from "contracts\Router\MADRouter1155.sol";
// import {MADRouter721} from "contracts\Router\MADRouter721.sol";
// import {MADRouterBase} from "contracts\Router\MADRouterBase.sol";
// import {EventsAndErrors} from "contracts\Shared\EventsAndErrors.sol";
// import {MADBase} from "contracts\Shared\MADBase.sol";
// import {Types} from "contracts\Shared\Types.sol";

// contract StaticAnalysis {}
