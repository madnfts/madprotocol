// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

//prettier-ignore
abstract contract TwoFactor {
    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    uint256 internal constant _NOT_AUTHORISED = 0x1648fd01;
    uint256 internal constant _ZERO_ADDRESS = 0xd92e233d;

    /// @dev 0x1648fd01
    error NotAuthorised();
    /// @dev 0xd92e233d
    error ZeroAddress();

    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    uint256 internal constant _OWNER_UPDATED =
        0xb9312e2100469bd44e3f762c248f4dcc8d7788906fabf34f79db45920c37e269;
    uint256 internal constant _ROUTER_SET =
        0xc6b438e6a8a59579ce6a4406cbd203b740e0d47b458aae6596339bcd40c40d15;

    event OwnerUpdated(address indexed user, address indexed newOwner);

    event RouterSet(address indexed newRouter);

    ////////////////////////////////////////////////////////////////
    //                      OWNERSHIP STORAGE                     //
    ////////////////////////////////////////////////////////////////

    uint256 internal router;
    uint256 internal owner;

    bool public routerHasAuthority;

    /// @notice modifier to check if caller is the owner to call functions such
    /// as withdraw.
    ///     the router is not allowed access via this modifier.
    /// @dev checks the caller against the owner storage slot
    modifier onlyOwner() virtual {
        // if (msg.sender != owner) revert NotAuthorised();
        assembly {
            if iszero(eq(shl(12, caller()), sload(owner.slot))) {
                // revert NotAuthorised()
                mstore(0, _NOT_AUTHORISED)
                revert(28, 4)
            }
        }
        _;
    }

    /// @notice modifier to check if caller is the router to call functions.
    /// @dev checks the caller against the router storage slot
    modifier routerOrPublic() virtual {
        if (routerHasAuthority) {
            assembly {
                let _caller := shl(12, caller())
                let _router := sload(router.slot)
                if iszero(eq(_caller, _router)) {
                    // revert NotAuthorised()
                    mstore(0, _NOT_AUTHORISED)
                    revert(28, 4)
                }
            }
        }
        _;
    }

    /// @notice modifier to check if caller / origin combined is authorised to  call
    /// functions
    /// @dev checks the caller and origin against the router and owner storage
    /// slots
    /// Only 2 combinations are allowed.
    // In both cases, the owner HAS to be involved
    // The Router MUST check that the owner is the msg.sender in the router
    // contract.
    /// 1. msg.sender AND tx.origin == owner
    /// 2. msg.sender == router AND tx.origin == owner
    modifier authorised() {
        routerAuthorised();
        bool isAuthorised;
        assembly {
            let _origin := shl(12, origin())
            let _caller := shl(12, caller())
            let _router := sload(router.slot)
            let _owner := sload(owner.slot)
            isAuthorised :=
                xor(
                    and(eq(_caller, _owner), eq(_origin, _owner)),
                    and(eq(_caller, _router), eq(_origin, _owner))
                )

            if iszero(isAuthorised) {
                {
                    // revert NotAuthorised()
                    mstore(0, _NOT_AUTHORISED)
                    revert(28, 4)
                }
            }
        }
        _;
    }

    modifier noZeroAddr(address _addr) {
        assembly {
            if iszero(_addr) {
                // revert ZeroAddress()
                mstore(0, _ZERO_ADDRESS)
                revert(28, 4)
            }
        }
        _;
    }

    function routerAuthorised() internal view {
        assembly {
            if iszero(sload(routerHasAuthority.slot)) {
                // revert NotAuthorised()
                mstore(0, _NOT_AUTHORISED)
                revert(28, 4)
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(address _router, address _owner)
        noZeroAddr(_router)
        noZeroAddr(_owner)
    {
        assembly {
            sstore(router.slot, shl(12, _router))
            sstore(owner.slot, shl(12, _owner))
            sstore(routerHasAuthority.slot, 1)

            // emit OwnerUpdated
            log3(0, 0, _OWNER_UPDATED, caller(), _owner)
            // emit RouterSet
            log2(0, 0, _ROUTER_SET, _router)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNERSHIP LOGIC                      //
    ////////////////////////////////////////////////////////////////

    /// @dev Function Signature := 0xa7016023
    function setOwnership(address _owner)
        public
        authorised
        noZeroAddr(_owner)
    {
        assembly {
            sstore(owner.slot, shl(12, _owner))

            // emit OwnerUpdated
            log3(0, 0, _OWNER_UPDATED, caller(), _owner)
        }
    }

    ///@notice function to set the router has authority to access certain
    /// functions
    function setRouterHasAuthority(bool _hasAuthority) public onlyOwner {
        assembly {
            sstore(routerHasAuthority.slot, _hasAuthority)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                        PUBLIC GETTERS                      //
    ////////////////////////////////////////////////////////////////

    /// @dev Function Signature := 0xb0f479a1
    function getRouter() public view returns (address) {
        assembly {
            mstore(0, shr(12, sload(router.slot)))
            return(0, 32)
        }
    }

    /// @dev Function Signature := 0x893d20e8
    function getOwner() public view returns (address) {
        assembly {
            mstore(0, shr(12, sload(owner.slot)))
            return(0, 32)
        }
    }
}
