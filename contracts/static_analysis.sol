// SPDX-License-Identifier: AGPL-3.0-only
//
//pragma solidity 0.8.19;
//
//import "contracts/MAD.sol";
//import "contracts/static_analysis.sol";
//import "contracts/Factory/MADFactory1155.sol";
//import "contracts/Factory/MADFactory721.sol";
//import "contracts/Factory/MADFactoryBase.sol";
//import "contracts/lib/auth/FactoryVerifier.sol";
//import "contracts/lib/auth/Owned.sol";
//import "contracts/lib/deployers/ERC1155Deployer.sol";
//import "contracts/lib/deployers/ERC721Deployer.sol";
//import "contracts/lib/deployers/SplitterDeployer.sol";
//import "contracts/lib/security/DCPrevent.sol";
//import "contracts/lib/security/Pausable.sol";
//import "contracts/lib/security/ReentrancyGuard.sol";
//import "contracts/lib/splitter/SplitterEventsAndErrors.sol";
//import "contracts/lib/splitter/SplitterImpl.sol";
//import "contracts/lib/test/erc1155-mock.sol";
//import "contracts/lib/test/erc20-mock.sol";
//import "contracts/lib/test/erc2981-mock.sol";
//import "contracts/lib/test/erc721-mock.sol";
//import "contracts/lib/test/test-interfaces.sol";
//import "contracts/lib/tokens/ERC20.sol";
//import "contracts/lib/tokens/common/ERC2981.sol";
//import "contracts/lib/tokens/common/FeeOracle.sol";
//import "contracts/lib/tokens/ERC1155/Base/ERC1155B.sol";
//import "contracts/lib/tokens/ERC1155/Base/interfaces/IERC1155.sol";
//import "contracts/lib/tokens/ERC1155/Base/utils/ERC1155Holder.sol";
//import "contracts/lib/tokens/ERC721/Base/ERC721.sol";
//import "contracts/lib/tokens/ERC721/Base/interfaces/IERC721.sol";
//import "contracts/lib/tokens/ERC721/Base/utils/ERC721Holder.sol";
//import "contracts/lib/uniswap/ISwapRouter.sol";
//import "contracts/lib/uniswap/IUniswapV3SwapCallback.sol";
//import "contracts/lib/utils/Counters.sol";
//import "contracts/lib/utils/CREATE3.sol";
//import "contracts/lib/utils/MerkleProof.sol";
//import "contracts/lib/utils/SafeTransferLib.sol";
//import "contracts/lib/utils/Strings.sol";
//import "contracts/MADTokens/common/ImplBase.sol";
//import "contracts/MADTokens/common/interfaces/ImplBaseEventsAndErrors.sol";
//import "contracts/MADTokens/ERC1155/ERC1155Basic.sol";
//import "contracts/MADTokens/ERC721/ERC721Basic.sol";
//import "contracts/Marketplace/MADMarketplace1155.sol";
//import "contracts/Marketplace/MADMarketplace721.sol";
//import "contracts/Marketplace/MADMarketplaceBase.sol";
//import "contracts/Router/MADRouter1155.sol";
//import "contracts/Router/MADRouter721.sol";
//import "contracts/Router/MADRouterBase.sol";
//import "contracts/Shared/EventsAndErrors.sol";
//import "contracts/Shared/MADBase.sol";
//import "contracts/Shared/Types.sol";
//
//contract StaticAnalysis {}
