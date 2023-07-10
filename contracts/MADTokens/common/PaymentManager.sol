// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ERC20 } from "contracts/lib/tokens/ERC20.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";

abstract contract PaymentManager {
    ////////////////////////////////////////////////////////////////
    //                          ERRORS                            //
    ////////////////////////////////////////////////////////////////

    error NothingToWithdraw();
    error WrongToken();

    ////////////////////////////////////////////////////////////////
    //                          IMMUTABLE                         //
    ////////////////////////////////////////////////////////////////

    /// @notice Public mint price.
    uint256 public immutable price;

    /// @notice Splitter address relationship.
    SplitterImpl public immutable splitter;

    /// @notice ERC20 payment token address.
    ERC20 public immutable erc20;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice total amount of fees accumulated in native currency.
    uint256 public feeCount;

    /// @notice total amount of fees accumulated in wrapped token (erc20).
    uint256 public feeCountERC20;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////
    constructor(address _splitter, address _erc20, uint256 _price) {
        splitter = SplitterImpl(payable(_splitter));
        erc20 = ERC20(payable(_erc20));
        price = _price;
    }

    ////////////////////////////////////////////////////////////////
    //             OWNER WITHDRAW / FEE DISTRIBUTION              //
    ////////////////////////////////////////////////////////////////

    modifier _isZeroAddr(address _addr) {
        assembly {
            if iszero(_addr) {
                // Revert ZeroAddress()
                mstore(0x00, 0xd92e233d)
                revert(0x1c, 0x04)
            }
        }
        _;
    }

    function _withdraw(address _recipient) internal _isZeroAddr(_recipient) {
        _withdrawShared(_recipient, ERC20(address(0)));
    }

    function _withdrawERC20(address _erc20, address _recipient)
        internal
        _isZeroAddr(_recipient)
    {
        ERC20 _token = ERC20(payable(_erc20));
        _withdrawShared(_recipient, _token);
    }

    function _withdrawShared(address _recipient, ERC20 _token) private {
        uint256 len = splitter.payeesLength();

        // Transfer mint fees
        uint256 _val = _dispatchFees(_recipient, _token);

        uint256 j;
        while (j < len) {
            address addr = splitter._payees(j);
            if (address(_token) == address(0)) {
                SafeTransferLib.safeTransferETH(
                    addr, ((_val * (splitter._shares(addr) * 1e2)) / 10_000)
                );
            } else {
                SafeTransferLib.safeTransfer(
                    _token,
                    addr,
                    ((_val * (splitter._shares(addr) * 1e2)) / 10_000)
                );
            }
            unchecked {
                ++j;
            }
        }
    }

    function _dispatchFees(address _recipient, ERC20 _erc20)
        internal
        returns (uint256 _val)
    {
        if (address(_erc20) != address(0)) {
            uint256 _feeCountERC20 = feeCountERC20;
            if (_feeCountERC20 == 0) revert NothingToWithdraw();
            if (_erc20 != erc20) revert WrongToken();

            _val = erc20.balanceOf(address(this)) - _feeCountERC20;
            feeCountERC20 = 0;

            SafeTransferLib.safeTransfer(erc20, _recipient, _feeCountERC20);

            return _val;
        } else {
            uint256 _feeCount = feeCount;
            if (_feeCount == 0) revert NothingToWithdraw();

            _val = address(this).balance - _feeCount;
            feeCount = 0;

            SafeTransferLib.safeTransferETH(payable(_recipient), _feeCount);

            return _val;
        }
    }

    function _publicPaymentHandler(uint256 _value) internal {
        if (msg.value == 0) {
            feeCountERC20 = feeCountERC20 + price;
            SafeTransferLib.safeTransferFrom(
                erc20, msg.sender, address(this), _value
            );
        } else {
            feeCount = feeCount + price;
        }
    }

    ////////////////////////////////////////////////////////////////
    //                     INTERNAL HELPERS                       //
    ////////////////////////////////////////////////////////////////
    function _publicMintPriceCheck(uint256 _amount)
        internal
        view
        returns (uint256 _value)
    {
        // if ((_price * _amount) != value)
        // revert WrongPrice();

        _value = _getPriceValue(msg.sender);
        uint256 _price = price;
        assembly {
            if iszero(eq(mul(_price, _amount), _value)) {
                // revert WrongPrice();
                mstore(0, 0xf7760f25)
                revert(28, 4)
            }
        }
    }

    function _getPriceValue(address _buyer)
        internal
        view
        returns (uint256 _value)
    {
        if (msg.value != 0) {
            _value = msg.value;
        } else {
            _value = erc20.allowance(_buyer, address(this));
        }
        // assembly {
        //     switch callvalue()
        //     case 0 {
        //         mstore(20, _buyer)
        //         mstore(52, address())
        //         mstore(0, shl(96, 0xdd62ed3e))
        //         pop(staticcall(gas(), _erc20, 16, 68, 0, 32))
        //         _value := mload(0)
        //         mstore(52, 0)
        //         isERC20 := 1
        //     }
        //     default {
        //         _value := callvalue()
        //         isERC20 := 0
        //     }
        // }
    }
}
