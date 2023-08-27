// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

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
    /// @param _factory 1155 factory address.
    /// @param _paymentTokenAddress erc20 token address | address(0).
    /// @param _recipient 721 factory address.
    // B.1 - Remove maxFeeMint &  maxFeeBurn from constructor
    constructor(
        FactoryVerifier _factory,
        address _paymentTokenAddress,
        address _recipient
    ) MADRouterBase(_factory, _paymentTokenAddress, _recipient) {}

    ////////////////////////////////////////////////////////////////
    //                    CREATOR MINTING ERC721                  //
    ////////////////////////////////////////////////////////////////

    /// @notice ERC721Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param _token 721 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    function basicMintTo(address _token, address _to, uint128 _amount)
        public
        payable
    {
        _tokenRender(_token);
        _paymentCheck(_FEE_MINT);
        ERC721Basic(_token).mintTo{ value: msg.value }(_to, _amount);
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param _token 721 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC721Minimal` type.
    function burn(address _token, uint128[] memory _ids) public payable {
        _tokenRender(_token);
        _paymentCheck(_FEE_BURN);
        ERC721Basic(_token).burn{ value: msg.value }(_ids);
    }

    ////////////////////////////////////////////////////////////////
    //                   CREATOR MINTING  ERC1155                 //
    ////////////////////////////////////////////////////////////////

    /// @notice ERC1155Basic creator mint function handler.
    /// @dev Function Sighash := 0x490f7027
    /// @param _token 1155 token address.
    /// @param _to Receiver token address.
    /// @param _amount Num tokens to mint and send.
    /// @param _balance Receiver token balance.
    function basicMintTo(
        address _token,
        address _to,
        uint128 _amount,
        uint128 _balance
    ) public payable {
        _tokenRender(_token);
        _paymentCheck(_FEE_MINT);
        ERC1155Basic(_token).mintTo{ value: msg.value }(_to, _amount, _balance);
    }

    /// @dev Function Sighash := 0x535f64e7
    /// @param _token 1155 token address.
    /// @param _to Token receiver address.
    /// @param _ids Receiver token _ids array.
    /// @param _balances Receiver token balances array, length should be =
    /// _ids.length.
    function basicMintBatchTo(
        address _token,
        address _to,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) public payable {
        _tokenRender(_token);
        _paymentCheck(_FEE_MINT);
        ERC1155Basic(_token).mintBatchTo{ value: msg.value }(
            _to, _ids, _balances
        );
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param _token 1155 token address.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param to Array of addresses who own each token.
    /// @param _amount Array of receiver token balances array.
    function burn(
        address _token,
        uint128[] memory _ids,
        address[] memory to,
        uint128[] memory _amount
    ) public payable {
        _tokenRender(_token);
        _paymentCheck(_FEE_BURN);
        ERC1155Basic(_token).burn{ value: msg.value }(to, _ids, _amount);
    }

    /// @notice Global token batch burn controller/single pusher for all token
    /// types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param _token 1155 token address.
    /// @param _from Array of addresses who own each token.
    /// @param _ids The token IDs of each token to be burnt;
    ///        should be left empty for the `ERC1155Minimal` type.
    /// @param _balances Array of corresponding token balances to burn.
    function batchBurn(
        address _token,
        address _from,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) public payable {
        _tokenRender(_token);
        _paymentCheck(_FEE_BURN);
        ERC1155Basic(_token).burnBatch{ value: msg.value }(
            _from, _ids, _balances
        );
    }
}
