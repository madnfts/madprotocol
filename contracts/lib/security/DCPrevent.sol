// // SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

abstract contract DCPrevent {
    address private immutable og;

    error BadCall();

    modifier isThisOg() {
        selfReferencePointer();
        _;
    }

    constructor() {
        og = address(this);
    }

    function selfReferencePointer() private view {
        if (address(this) != og) revert BadCall();
    }
}
