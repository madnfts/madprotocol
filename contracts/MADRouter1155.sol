// SPDX-License-Identifier: AGPL-3.0-only

/* 
DISCLAIMER: 
This contract hasn't been audited yet. Most likely contains unexpected bugs. 
Don't trust your funds to be held by this code before the final thoroughly tested and audited version release.
*/

pragma solidity 0.8.4;

import { MAD } from "./MAD.sol";
import { RouterEvents, FactoryVerifier } from "./EventsAndErrors.sol";

import { ERC20 } from "./lib/tokens/ERC20.sol";
import { ERC1155Minimal } from "./lib/tokens/ERC1155/Impl/ERC1155Minimal.sol";
import { ERC1155Basic } from "./lib/tokens/ERC1155/Impl/ERC1155Basic.sol";
import { ERC1155Whitelist } from "./lib/tokens/ERC1155/Impl/ERC1155Whitelist.sol";
import { ERC1155Lazy } from "./lib/tokens/ERC1155/Impl/ERC1155Lazy.sol";

import { ReentrancyGuard } from "./lib/security/ReentrancyGuard.sol";
import { Pausable } from "./lib/security/Pausable.sol";
import { Owned } from "./lib/auth/Owned.sol";
import { FeeOracle } from "./lib/tokens/common/FeeOracle.sol";

contract MADRouter1155 is
    MAD,
    RouterEvents,
    Owned(msg.sender),
    Pausable,
    ReentrancyGuard,
    FeeOracle
{
    /// @dev Function Sighash := 0x06fdde03
    function name()
        public
        pure
        override(MAD)
        returns (string memory)
    {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x46, 0x6726F75746572)
            return(0x20, 0x60)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    FactoryVerifier public MADFactory1155;

    bytes4 internal constant MINSAFEMINT = 0x40d097c3;
    bytes4 internal constant MINBURN = 0x44df8e70;

    uint256 public feeMint = 0.25 ether;
    uint256 public feeBurn = 0;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(FactoryVerifier _factory) {
        MADFactory1155 = _factory;
    }

    ////////////////////////////////////////////////////////////////
    //                       CREATOR SETTINGS                     //
    ////////////////////////////////////////////////////////////////

    /// @notice Collection `_uri` setter.
    /// @dev Only available for Basic, Whitelist and Lazy token types.
    /// @dev Function Sighash := 0x4328bd00
    /// @dev Events logged by each tokens' functions.
    function setURI(address _token, string memory _uri)
        external
        nonReentrant
        whenNotPaused
    {
        (bytes32 _colID, uint8 _tokenType) = _tokenRender(
            _token
        );

        if (_tokenType == 1) {
            ERC1155Basic(_token).setURI(_uri);
            emit BaseURI(_colID, _uri);
        } else if (_tokenType == 2) {
            ERC1155Whitelist(_token).setURI(_uri);
            emit BaseURI(_colID, _uri);
        } else if (_tokenType > 2) {
            ERC1155Lazy(_token).setURI(_uri);
            emit BaseURI(_colID, _uri);
        } else {
            revert("INVALID_TYPE");
        }
    }

    /// @notice `ERC1155Whitelist` whitelist config setter.
    /// @dev Function Sighash := 0xa123c38d
    /// @dev Event emitted by `ERC1155Whitelist`
    /// token implementation contracts.
    function whitelistSettings(
        address _token,
        uint256 _price,
        uint256 _supply,
        bytes32 _root
    ) external nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).whitelistConfig(
                _price,
                _supply,
                _root
            );
        } else revert("INVALID_TYPE");
    }

    /// @notice `ERC1155Whitelist` free claim config setter.
    /// @dev Function Sighash := 0xcab2e41f
    /// @dev Event emitted by `ERC1155Whitelist`
    /// token implementation contracts.
    function freeSettings(
        address _token,
        uint256 _freeAmount,
        uint256 _maxFree,
        bytes32 _claimRoot
    ) external nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).freeConfig(
                _freeAmount,
                _maxFree,
                _claimRoot
            );
        } else revert("INVALID_TYPE");
    }

    /// @notice `ERC1155Minimal` creator mint function handler.
    /// @dev Function Sighash := 0x42a42752
    function minimalSafeMint(address _token, address _to, uint256 balance)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType != 0) revert("INVALID_TYPE");
        ERC1155Minimal(_token).safeMint(_to, balance);
    }

    function basicMintTo(
        address _token,
        address _to,
        uint256 _amount,
        uint256[] memory _balances
    ) external payable nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType != 1) revert("INVALID_TYPE");
        ERC1155Basic(_token).mintTo(_to, _amount, _balances);
    }

    function basicMintBatchTo(
        address _token,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _balances
    ) external payable nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType != 1) revert("INVALID_TYPE");
        ERC1155Basic(_token).mintBatchTo(_to, _ids, _balances);
    }

    /// @notice Global token burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param _ids The token IDs of each token to be burnt;
    /// should be left empty for the `ERC1155Minimal` type.
    /// @dev Transfer events emitted by nft implementation contracts.
    function burn(address _token, uint256[] memory _ids, address[] memory to, uint256[] memory _amount)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        (, uint8 _tokenType) = _tokenRender(_token);

        _tokenType < 1
            ? ERC1155Minimal(_token).burn(to[0], _amount[0])
            : _tokenType == 1
            ? ERC1155Basic(_token).burn(to, _ids, _amount)
            : _tokenType == 2
            ? ERC1155Whitelist(_token).burn(to, _ids, _amount)
            : _tokenType > 2
            ? ERC1155Lazy(_token).burn(to, _ids, _amount)
            : revert("INVALID_TYPE");
    }

    /// @notice Global token batch burn controller/single pusher for all token types.
    /// @dev Function Sighash := 0xba36b92d
    /// @param _ids The token IDs of each token to be burnt;
    /// should be left empty for the `ERC1155Minimal` type.
    /// @dev Transfer events emitted by nft implementation contracts.
    function batchBurn(
        address _token,
        address _from,
        uint256[] memory _ids,
        uint256[] memory _balances
    ) external payable nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);

        _tokenType == 1
            ? ERC1155Basic(_token).burnBatch(_from, _ids, _balances)
            : _tokenType == 2
            ? ERC1155Whitelist(_token).burnBatch(_from, _ids, _balances)
            : _tokenType > 2
            ? ERC1155Lazy(_token).burnBatch(_from, _ids, _balances)
            : revert("INVALID_TYPE");
    }

    /// @notice Global MintState setter/controller with switch
    /// cases/control flow handling conditioned by
    /// both `_stateType` and `_tokenType`.
    /// @dev Function Sighash := 0xab9acd57
    /// @dev Events logged by each tokens' `setState` functions.
    /// @param _stateType Values legend:
    /// 0 := PublicMintState (minimal, basic, whitelist);
    /// 1 := WhitelistMintState (whitelist);
    /// 2 := FreeClaimState (whitelist).
    function setMintState(
        address _token,
        bool _state,
        uint8 _stateType
    ) external nonReentrant whenNotPaused {
        require(_stateType < 3, "INVALID_TYPE");
        (bytes32 _colID, uint8 _tokenType) = _tokenRender(
            _token
        );

        if (_stateType < 1) {
            _stateType0(_tokenType, _token, _state);
            emit PublicMintState(_colID, _tokenType, _state);
        } else if (_stateType == 1) {
            _stateType1(_tokenType, _token, _state);
            emit WhitelistMintState(
                _colID,
                _tokenType,
                _state
            );
        } else if (_stateType == 2) {
            _stateType2(_tokenType, _token, _state);
            emit FreeClaimState(_colID, _tokenType, _state);
        }
    }

    /// @notice `ERC1155Whitelist` mint to creator function handler.
    /// @dev Function Sighash := 0x182ee485
    function creatorMint(address _token, uint256 _amount, uint256[] memory _balances, uint256 totalBalance)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).mintToCreator(_amount, _balances, totalBalance);
        } else revert("INVALID_TYPE");
    }

    /// @notice `ERC1155Whitelist` batch mint to creator function handler.
    /// @dev Function Sighash := 0x182ee485
    function creatorBatchMint(
        address _token,
        uint256[] memory _ids,
        uint256[] memory _balances,
        uint256 totalBalance
    ) external payable nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).mintBatchToCreator(_ids, _balances, totalBalance);
        } else revert("INVALID_TYPE");
    }

    /// @notice `ERC1155Whitelist` gift tokens function handler.
    /// @dev Function Sighash := 0x67b5a642
    function gift(
        address _token,
        address[] calldata _addresses,
        uint256[] memory _balances,
        uint256 totalBalance
    ) external payable nonReentrant whenNotPaused {
        (, uint8 _tokenType) = _tokenRender(_token);
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).giftTokens(_addresses, _balances, totalBalance);
        } else revert("INVALID_TYPE");
    }

    ////////////////////////////////////////////////////////////////
    //                       CREATOR WITHDRAW                     //
    ////////////////////////////////////////////////////////////////

    /// @notice Withdraw both ERC20 and ONE from ERC1155 contract's balance.
    /// @dev Function Sighash := 0x9547ed5d
    /// @dev Leave `_token` param empty for withdrawing eth only.
    /// @dev No withdraw min needs to be passed as params, since
    /// all balance from the token's contract is emptied.
    function withdraw(address _token, ERC20 _erc20)
        external
        nonReentrant
        whenNotPaused
    {
        (bytes32 _colID, uint8 _tokenType) = _tokenRender(
            _token
        );

        if (_tokenType < 1) {
            address(_erc20) != address(0) &&
                _erc20.balanceOf(_token) != 0
                ? ERC1155Minimal(_token).withdrawERC20(_erc20)
                : _token.balance != 0
                ? ERC1155Minimal(_token).withdraw()
                : revert("NO_FUNDS");

            emit TokenFundsWithdrawn(
                _colID,
                _tokenType,
                msg.sender
            );
        }

        if (_tokenType == 1) {
            address(_erc20) != address(0) &&
                _erc20.balanceOf(_token) != 0
                ? ERC1155Basic(_token).withdrawERC20(_erc20)
                : _token.balance != 0
                ? ERC1155Basic(_token).withdraw()
                : revert("NO_FUNDS");

            emit TokenFundsWithdrawn(
                _colID,
                _tokenType,
                msg.sender
            );
        }

        if (_tokenType == 2) {
            address(_erc20) != address(0) &&
                _erc20.balanceOf(_token) != 0
                ? ERC1155Whitelist(_token).withdrawERC20(
                    _erc20
                )
                : _token.balance != 0
                ? ERC1155Whitelist(_token).withdraw()
                : revert("NO_FUNDS");

            emit TokenFundsWithdrawn(
                _colID,
                _tokenType,
                msg.sender
            );
        }

        if (_tokenType > 2) {
            address(_erc20) != address(0) &&
                _erc20.balanceOf(_token) != 0
                ? ERC1155Lazy(_token).withdrawERC20(_erc20)
                : _token.balance != 0
                ? ERC1155Lazy(_token).withdraw()
                : revert("NO_FUNDS");

            emit TokenFundsWithdrawn(
                _colID,
                _tokenType,
                msg.sender
            );
        }
    }

    ////////////////////////////////////////////////////////////////
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    function feeLookup(bytes4 sigHash)
        external
        override(FeeOracle)
        view
        returns (uint256 fee) {

        assembly {
            for {} 1 {} {
                if eq(MINSAFEMINT, sigHash) {
                    fee := sload(feeMint.slot)
                    break
                }
                if eq(MINBURN, sigHash) {
                    fee := sload(feeBurn.slot)
                    break
                }
                fee := 0x00
                break
            }
        }
    }

    function setFees(
        uint256 _feeMint,
        uint256 _feeBurn
    ) external onlyOwner {
        assembly {
            sstore(feeBurn.slot, _feeBurn)
            sstore(feeMint.slot, _feeMint)
        }

        emit FeesUpdated(_feeMint, _feeBurn);
    }

    /// @notice Private auth-check mechanism that verifies `MADFactory` storage.
    /// @dev Retrieves both `colID` (bytes32) and collection type (uint8)
    /// for valid token and approved user.
    /// @dev Function Sighash := 0xdbf62b2e
    function _tokenRender(address _token)
        private
        view
        returns (bytes32 colID, uint8 tokenType)
    {
        colID = MADFactory1155.getColID(_token);
        MADFactory1155.creatorCheck(colID);
        tokenType = MADFactory1155.typeChecker(colID);
    }

    /// @notice Internal function helper for resolving `PublicMintState` path.
    /// @dev Function Sighash := 0xde21620a
    function _stateType0(
        uint8 _tokenType,
        address _token,
        bool _state
    ) internal {
        if (_tokenType < 1) {
            ERC1155Minimal(_token).setPublicMintState(_state);
        } else if (_tokenType == 1) {
            ERC1155Basic(_token).setPublicMintState(_state);
        } else if (_tokenType == 2) {
            ERC1155Whitelist(_token).setPublicMintState(
                _state
            );
        } else revert("INVALID_TYPE");
    }

    /// @notice Internal function helper for resolving `WhitelistMintState` path.
    /// @dev Function Sighash := 0x90036d9e
    function _stateType1(
        uint8 _tokenType,
        address _token,
        bool _state
    ) internal {
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).setWhitelistMintState(
                _state
            );
        } else revert("INVALID_TYPE");
    }

    /// @notice Internal function helper for resolving `FreeClaimState` path.
    /// @dev Function Sighash := 0xff454f63
    function _stateType2(
        uint8 _tokenType,
        address _token,
        bool _state
    ) internal {
        if (_tokenType == 2) {
            ERC1155Whitelist(_token).setFreeClaimState(
                _state
            );
        } else revert("INVALID_TYPE");
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev Function Signature := 0x13af4035
    function setOwner(address newOwner)
        public
        override
        onlyOwner
    {
        // owner = newOwner;
        assembly {
            sstore(owner.slot, newOwner)
        }

        emit OwnerUpdated(msg.sender, newOwner);
    }

    /// @notice Change the address used for lazy minting voucher validation.
    /// @dev Function Sighash := 0x17f9fad1
    /// @dev Event emitted by token contract.
    function setSigner(address _token, address _signer)
        external
        onlyOwner
    {
        ERC1155Lazy(_token).setSigner(_signer);
    }

    /// @notice Paused state initializer for security risk mitigation pratice.
    /// @dev Function Sighash := 0x8456cb59
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpaused state initializer for security risk mitigation pratice.
    /// @dev Function Sighash := 0x3f4ba83a
    function unpause() external onlyOwner {
        _unpause();
    }
}
