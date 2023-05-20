// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ERC20 } from "contracts/lib/tokens/ERC20.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";

abstract contract PaymentManager {
    ////////////////////////////////////////////////////////////////
    //                          IMMUTABLE                         //
    ////////////////////////////////////////////////////////////////

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
    constructor(address _splitter, address _erc20) {
        splitter = SplitterImpl(payable(_splitter));
        erc20 = ERC20(payable(_erc20));
    }

    ////////////////////////////////////////////////////////////////
    //             OWNER WITHDRAW / FEE DISTRIBUTION              //
    ////////////////////////////////////////////////////////////////

    function _withdraw(address _recipient) internal {
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);

        // Transfer mint fees
        uint256 _val = _dispatchFees(_recipient, ERC20(address(0)));

        // Transfer splitter funds to shareholders
        for (uint256 i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransferETH(addrs[j], values[j]);
            unchecked {
                ++j;
            }
        }
    }

    function _withdrawERC20(address _erc20, address _recipient) internal {
        ERC20 _token = ERC20(payable(_erc20));
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);

        // Transfer mint fees
        uint256 _val = _dispatchFees(_recipient, _token);

        // Transfer splitter funds to shareholders
        for (uint256 i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransfer(_token, addrs[j], values[j]);
            unchecked {
                ++j;
            }
        }
    }

    function _dispatchFees(address _recipient, ERC20 _erc20) internal returns (uint256 _val) {
        if (address(_erc20) != address(0)) {
            uint256 _feeCountERC20 = feeCountERC20;
            if (_feeCountERC20 != 0 && _erc20 == erc20 && _recipient != address(0)) {
                _val = erc20.balanceOf(address(this)) - _feeCountERC20;
                SafeTransferLib.safeTransfer(erc20, _recipient, _feeCountERC20);
                feeCountERC20 = 0;
                return _val;
            } else {
                return _val = _erc20.balanceOf(address(this));
            }
        } else {
            uint256 _feeCount = feeCount;
            if (_feeCount != 0 && _recipient != address(0)) {
                _val = address(this).balance - _feeCount;
                SafeTransferLib.safeTransferETH(payable(_recipient), _feeCount);
                feeCount = 0;
                return _val;
            } else {
                return _val = address(this).balance;
            }
        }
    }

    function _publicPaymentHandler(bool _method, uint256 _value, uint256 _fee) internal {
        if (_method == true) {
            feeCountERC20 = feeCountERC20 + _fee;
            SafeTransferLib.safeTransferFrom(erc20, msg.sender, address(this), _value);
        } else {
            feeCount = feeCount + _fee;
        }
    }

    function _ownerFeeHandler(bool _method, uint256 _fee, address _erc20Owner) internal {
        if (_method == true) {
            feeCountERC20 = feeCountERC20 + _fee;
            SafeTransferLib.safeTransferFrom(erc20, _erc20Owner, address(this), _fee);
        } else {
            feeCount = feeCount + _fee;
        }
    }

    ////////////////////////////////////////////////////////////////
    //                     INTERNAL HELPERS                       //
    ////////////////////////////////////////////////////////////////

    function _publicMintPriceCheck(
        uint256 _price,
        uint256 _amount
    ) internal view returns (uint256 _fee, uint256 _value, bool _method) {
        // if ((_price * _amount) + _fee != value)
        // revert WrongPrice();

        _fee = _getFeeValue(0x40d097c3);
        (_value, _method) = _getPriceValue(msg.sender, erc20);

        assembly {
            if iszero(eq(add(mul(_price, _amount), _fee), _value)) {
                mstore(0, 0xf7760f25)
                revert(28, 4)
            }
        }
    }

    function _ownerFeeCheck(bytes4 _selector, address _erc20Owner) internal view returns (uint256 _fee, bool _method) {
        _fee = _getFeeValue(_selector);
        uint256 _value;
        (_value, _method) = _getPriceValue(_erc20Owner, erc20);

        assembly {
            if iszero(eq(_fee, _value)) {
                // revert WrongPrice();
                mstore(0, 0xf7760f25)
                revert(28, 4)
            }
        }
    }

    function _getPriceValue(address _buyer, ERC20 _erc20) internal view returns (uint256 _value, bool _method) {
        // if (msg.value != 0) {
        //    _value = msg.value;
        //    _method = false;
        // } else {
        //    _value = erc20.allowance(_buyer, address(this));
        //    _method = true;
        // }
        assembly {
            switch callvalue()
            case 0 {
                mstore(20, _buyer)
                mstore(52, address())
                mstore(0, shl(96, 0xdd62ed3e))
                pop(staticcall(gas(), _erc20, 16, 68, 0, 32))
                _value := mload(0)
                mstore(52, 0)
                _method := 1
            }
            default {
                _value := callvalue()
                _method := 0
            }
        }
    }

    function _getFeeValue(bytes4 _method) internal view virtual returns (uint256 value) {}
}
