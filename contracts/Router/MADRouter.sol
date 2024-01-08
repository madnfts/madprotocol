// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import {
    MADRouterBase,
    IERC20,
    FactoryVerifier
} from "contracts/Router/MADRouterBase.sol";

import { ERC1155Basic } from "contracts/MADTokens/ERC1155/ERC1155Basic.sol";

import { ERC721Basic } from "contracts/MADTokens/ERC721/ERC721Basic.sol";

contract MADRouter is MADRouterBase {
    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    /// @notice Constructor requires a valid factory address and an optional
    /// erc20 payment token address.
    /// @param _factory  factory address.
    /// @param _recipient fee payment address.
    constructor(FactoryVerifier _factory, address _recipient)
        MADRouterBase(_factory, _recipient)
    { }

    ////////////////////////////////////////////////////////////////
    //                    CREATOR MINTING ERC721                  //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Mint to, a public state-modifying function.
     * @notice Accepts ether.
     * @notice ERC721Basic creator mint function handler.
     * @param collection 721 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send. (uint128).
     * @custom:signature mintTo(address,address,uint128)
     * @custom:selector 0x49fa55ad
     */
    function mintTo(address collection, address _to, uint128 _amount)
        public
        payable
    {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).mintTo{ value: _value }(_to, _amount);
    }

    /**
     * @notice Mint to, a public state-modifying function.
     * @notice Accepts ether.
     *  @notice ERC721Basic creator mint function handler.
     * @param collection 721 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send. (uint128)
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature mintTo(address,address,uint128,address)
     * @custom:selector 0x395e37ec
     */
    function mintTo(
        address collection,
        address _to,
        uint128 _amount,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(uint256(_amount), madFeeTokenAddress, this.feeMintErc20);
        ERC721Basic(collection).mintTo(_to, _amount);
    }

    ///

    /**
     * @notice Burn, a public state-modifying function.
     * @notice Accepts ether.
     * @notice Global token burn controller/single pusher for ERC721 token
     * types.
     * @param collection 721 token address.
     * @param _ids The token IDs of each token to be burnt;uint128s.
     * @custom:signature burn(address,uint128[])
     * @custom:selector 0xf12bd09e
     */
    function burn(address collection, uint128[] memory _ids) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_BURN, _ids.length);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).burn{ value: _value }(_ids);
    }

    ///

    /**
     * @notice Burn, a public state-modifying function.
     * @notice Global token burn controller/single pusher for ERC721 token
     * types.
     * @notice Accepts ether.
     * @param collection 721 token address.
     * @param _ids The token IDs of each token to be burnt;
     * @param madFeeTokenAddress ERC20 token address for Mad Fees.
     * @custom:signature burn(address,uint128[],address)
     * @custom:selector 0xbb05d8ef
     */
    function burn(
        address collection,
        uint128[] memory _ids,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_ids.length, madFeeTokenAddress, this.feeMintErc20);
        ERC721Basic(collection).burn(_ids);
    }

    ////////////////////////////////////////////////////////////////
    //                    PUBLIC MINTING ERC721                  //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Mint, a public state-modifying function.
     * @notice Accepts ether.
     * @notice public mint function if madRouter is authorised.
     * This will open up public minting to this contract if the owner has
     * enabled the authorisation for the router.
     * @dev Transfer event emitted by parent ERC721 contract.
     * @dev collection 721 token address.
     * @param _amount The amount of tokens to mint.
     * @custom:signature mint(address,uint128)
     * @custom:selector 0xbe29184f
     */
    function mint(address collection, uint128 _amount) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).mint{ value: _value }(msg.sender, _amount);
    }

    /**
     * @notice Mint, a public state-modifying function.
     * @notice Accepts ether.
     * 	 @notice public mint function if madRouter is authorised.
     * This will open up public minting to this contract if the owner has
     * enabled the authorisation for the router.
     * @dev Transfer event emitted by parent ERC721 contract.
     * @dev collection 721 token address.
     * @param _amount The amount of tokens to mint.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature mint(address,uint128,address)
     * @custom:selector 0x9a255db6
     */
    function mint(
        address collection,
        uint128 _amount,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_amount, madFeeTokenAddress, this.feeMintErc20);
        ERC721Basic(collection).mint(msg.sender, _amount);
    }

    ////////////////////////////////////////////////////////////////
    //                   CREATOR MINTING  ERC1155                 //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Mint to, a public state-modifying function.
     * @notice Accepts ether.
     * 	 @notice ERC1155Basic creator mint function handler.
     * @param collection 1155 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send.
     * @param _balance Receiver token balance.
     * @custom:signature mintTo(address,address,uint128,uint128)
     * @custom:selector 0x292af4be
     */
    function mintTo(
        address collection,
        address _to,
        uint128 _amount,
        uint128 _balance
    ) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).mintTo{ value: _value }(_to, _amount, _balance);
    }

    /**
     * @notice Mint to, a public state-modifying function.
     * @notice Accepts ether.
     * @notice ERC1155Basic creator mint function handler.
     * @param collection 1155 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send.
     * @param _balance Receiver token balance.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature mintTo(address,address,uint128,uint128,address)
     * @custom:selector 0x0a7309b2
     */
    function mintTo(
        address collection,
        address _to,
        uint128 _amount,
        uint128 _balance,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_amount, madFeeTokenAddress, this.feeMintErc20);
        ERC1155Basic(collection).mintTo(_to, _amount, _balance);
    }

    /**
     * @notice Mint batch to, a public state-modifying function.
     * @notice Accepts ether.
     * @param collection 1155 token address.
     * @param _to Token receiver address.
     * @param _ids Receiver token _ids array.
     * @param _balances Receiver token balances array, length should be ==
     * _ids.length.
     * @custom:signature mintBatchTo(address,address,uint128[],uint128[])
     * @custom:selector 0xbfa33dd8
     */
    function mintBatchTo(
        address collection,
        address _to,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _ids.length);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).mintBatchTo{ value: _value }(
            _to, _ids, _balances
        );
    }

    /**
     * @notice Mint batch to, a public state-modifying function.
     * @notice Accepts ether.
     * @param collection 1155 token address.
     * @param _to Token receiver address.
     * @param _ids Receiver token _ids array.
     * @param _balances Receiver token balances array, length should be ==
     * _ids.length.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature
     * mintBatchTo(address,address,uint128[],uint128[],address)
     * @custom:selector 0x18c9fb16
     */
    function mintBatchTo(
        address collection,
        address _to,
        uint128[] memory _ids,
        uint128[] memory _balances,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_ids.length, madFeeTokenAddress, this.feeMintErc20);
        ERC1155Basic(collection).mintBatchTo(_to, _ids, _balances);
    }

    /**
     * @notice Burn, a public state-modifying function.
     * @notice Accepts ether.
     * 	  @notice Global token burn controller/single pusher for 1155 token
     * types.
     * @param collection 1155 token address.
     * @param _ids The token IDs of each token to be burnt;
     *        should be left empty for the `ERC1155Minimal` type.
     * @param to Array of addresses who own each token.
     * @param _amount Array of receiver token balances array.
     * @custom:signature burn(address,uint128[],address[],uint128[])
     * @custom:selector 0x21d501b9
     */
    function burn(
        address collection,
        uint128[] memory _ids,
        address[] memory to,
        uint128[] memory _amount
    ) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_BURN, _ids.length);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).burn{ value: _value }(to, _ids, _amount);
    }

    /**
     * @notice Burn, a public state-modifying function.
     * @notice Accepts ether.
     * @notice Global token burn controller/single pusher for 1155 token types.
     * @param collection 1155 token address.
     * @param _ids The token IDs of each token to be burnt;
     *        should be left empty for the `ERC1155Minimal` type.
     * @param to Array of addresses who own each token.
     * @param _amount Array of receiver token balances array.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature burn(address,uint128[],address[],uint128[],address)
     * @custom:selector 0xb5533845
     */
    function burn(
        address collection,
        uint128[] memory _ids,
        address[] memory to,
        uint128[] memory _amount,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_ids.length, madFeeTokenAddress, this.feeMintErc20);
        ERC1155Basic(collection).burn(to, _ids, _amount);
    }

    /**
     * @notice Batch burn, a public state-modifying function.
     * @notice Accepts ether.
     * @notice Global token batch burn controller/single pusher for 1155 token
     * types.
     * @param collection 1155 token address.
     * @param _from Array of addresses who own each token.
     * @param _ids The token IDs of each token to be burnt;
     *       should be left empty for the `ERC1155Minimal` type.
     * @param _balances Array of corresponding token balances to burn.
     * @custom:signature batchBurn(address,address,uint128[],uint128[])
     * @custom:selector 0x7f82d7e5
     */
    function batchBurn(
        address collection,
        address _from,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_BURN, _ids.length);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).burnBatch{ value: _value }(
            _from, _ids, _balances
        );
    }

    /**
     * @notice Batch burn, a public state-modifying function.
     * @notice Accepts ether.
     * @notice Global token batch burn controller/single pusher for 1155 token
     * types.
     * @param collection 1155 token address.
     * @param _from Array of addresses who own each token.
     * @param _ids The token IDs of each token to be burnt;
     *        should be left empty for the `ERC1155Minimal` type.
     * @param _balances Array of corresponding token balances to burn.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature batchBurn(address,address,uint128[],uint128[],address)
     * @custom:selector 0x4a6e87a8
     */
    function batchBurn(
        address collection,
        address _from,
        uint128[] memory _ids,
        uint128[] memory _balances,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_ids.length, madFeeTokenAddress, this.feeMintErc20);
        ERC1155Basic(collection).burnBatch(_from, _ids, _balances);
    }

    ////////////////////////////////////////////////////////////////
    //                    PUBLIC MINTING ERC1155                  //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Mint, a public state-modifying function.
     * @notice Accepts ether.
     * @notice ERC1155Basic creator mint function handler.
     * @param collection 1155 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send.
     * @custom:signature mint(address,address,uint128,uint128)
     * @custom:selector 0x66431b2d
     */
    function mint(address collection, address _to, uint128 _id, uint128 _amount)
        public
        payable
    {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).mint{ value: _value }(_to, _id, _amount);
    }

    /**
     * @notice Mint, a public state-modifying function.
     * @notice Accepts ether.
     * @notice ERC1155Basic creator mint function handler.
     * @param collection 1155 token address.
     * @param _to Receiver token address.
     * @param _amount Num tokens to mint and send.
     * @param madFeeTokenAddress ERC20 token address.
     * @custom:signature mint(address,address,uint128,uint128,address)
     * @custom:selector 0x0d9bd2aa
     */
    function mint(
        address collection,
        address _to,
        uint128 _id,
        uint128 _amount,
        address madFeeTokenAddress
    ) public payable {
        _tokenRender(collection);
        _handleFees(_amount, madFeeTokenAddress, this.feeMintErc20);
        ERC1155Basic(collection).mint(_to, _id, _amount);
    }
}
