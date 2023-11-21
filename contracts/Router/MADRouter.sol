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

    /// @notice ERC721Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 721 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    function mintTo(address collection, address _to, uint128 _amount)
        public
        payable
    {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).mintTo{ value: _value }(_to, _amount);
    }

    /// @notice ERC721Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 721 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    /// @param erc20Token ERC20 token address.
    function mintTo(
        address collection,
        address _to,
        uint128 _amount,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_MINT, _amount, erc20Token);
        ERC721Basic(collection).mintTo(_to, _amount);
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 721 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC721Minimal` type.
    function burn(address collection, uint128[] memory _ids) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_BURN, _ids.length);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).burn{ value: _value }(_ids);
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 721 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC721Minimal` type.
    /// @param erc20Token ERC20 token address.
    function burn(address collection, uint128[] memory _ids, address erc20Token)
        public
        payable
    {
        _tokenRender(collection);
        _handleFees(_FEE_BURN, _ids.length, erc20Token);
        ERC721Basic(collection).burn(_ids);
    }

    ////////////////////////////////////////////////////////////////
    //                    PUBLIC MINTING ERC721                  //
    ////////////////////////////////////////////////////////////////

    /// @notice public mint function if madRouter is authorised.
    /// This will open up public minting to this contract if the owner has
    /// enabled the authorisation for the router.
    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0xa0712d68
    /// @dev collection 721 token address.
    /// @param _amount The amount of tokens to mint.
    function mint(address collection, uint128 _amount) public payable {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC721Basic(collection).mint{ value: _value }(msg.sender, _amount);
    }

    /// @notice public mint function if madRouter is authorised.
    /// This will open up public minting to this contract if the owner has
    /// enabled the authorisation for the router.
    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0xa0712d68
    /// @dev collection 721 token address.
    /// @param _amount The amount of tokens to mint.
    /// @param erc20Token ERC20 token address.
    function mint(address collection, uint128 _amount, address erc20Token)
        public
        payable
    {
        _tokenRender(collection);
        _handleFees(_FEE_MINT, _amount, erc20Token);
        ERC721Basic(collection).mint(msg.sender, _amount);
    }

    ////////////////////////////////////////////////////////////////
    //                   CREATOR MINTING  ERC1155                 //
    ////////////////////////////////////////////////////////////////

    /// @notice ERC1155Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 1155 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    /// @param _balance Receiver token balance.
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

    /// @notice ERC1155Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 1155 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    /// @param _balance Receiver token balance.
    /// @param erc20Token ERC20 token address.
    function mintTo(
        address collection,
        address _to,
        uint128 _amount,
        uint128 _balance,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_MINT, _amount, erc20Token);
        ERC1155Basic(collection).mintTo(_to, _amount, _balance);
    }

    /// @dev Function Sighash := 0x535f64e7
    /// @param collection 1155 token address.
    /// @param _to Token receiver address.
    /// @param _ids Receiver token _ids array.
    /// @param _balances Receiver token balances array, length should be =
    /// _ids.length.
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

    /// @dev Function Sighash := 0x535f64e7
    /// @param collection 1155 token address.
    /// @param _to Token receiver address.
    /// @param _ids Receiver token _ids array.
    /// @param _balances Receiver token balances array, length should be =
    /// @param erc20Token ERC20 token address.
    /// _ids.length.
    function mintBatchTo(
        address collection,
        address _to,
        uint128[] memory _ids,
        uint128[] memory _balances,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_MINT, _ids.length, erc20Token);
        ERC1155Basic(collection).mintBatchTo(_to, _ids, _balances);
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 1155 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param to Array of addresses who own each token.
    /// @param _amount Array of receiver token balances array.
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

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 1155 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param to Array of addresses who own each token.
    /// @param _amount Array of receiver token balances array.
    /// @param erc20Token ERC20 token address.
    function burn(
        address collection,
        uint128[] memory _ids,
        address[] memory to,
        uint128[] memory _amount,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_BURN, _ids.length, erc20Token);
        ERC1155Basic(collection).burn(to, _ids, _amount);
    }

    /// @notice Global token batch burn controller/single pusher for all token
    /// types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 1155 token address.
    /// @param _from Array of addresses who own each token.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param _balances Array of corresponding token balances to burn.
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

    /// @notice Global token batch burn controller/single pusher for all token
    /// types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param collection 1155 token address.
    /// @param _from Array of addresses who own each token.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param _balances Array of corresponding token balances to burn.
    /// @param erc20Token ERC20 token address.
    function batchBurn(
        address collection,
        address _from,
        uint128[] memory _ids,
        uint128[] memory _balances,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_BURN, _ids.length, erc20Token);
        ERC1155Basic(collection).burnBatch(_from, _ids, _balances);
    }

    ////////////////////////////////////////////////////////////////
    //                    PUBLIC MINTING ERC1155                  //
    ////////////////////////////////////////////////////////////////

    /// @notice ERC1155Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 1155 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    function mint(address collection, address _to, uint128 _id, uint128 _amount)
        public
        payable
    {
        _tokenRender(collection);
        uint256 _fee = _handleFees(_FEE_MINT, _amount);
        uint256 _value = msg.value - _fee;
        ERC1155Basic(collection).mint{ value: _value }(_to, _id, _amount);
    }

    /// @notice ERC1155Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param collection 1155 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    /// @param erc20Token ERC20 token address.
    function mint(
        address collection,
        address _to,
        uint128 _id,
        uint128 _amount,
        address erc20Token
    ) public payable {
        _tokenRender(collection);
        _handleFees(_FEE_MINT, _amount, erc20Token);
        ERC1155Basic(collection).mint(_to, _id, _amount);
    }
}
