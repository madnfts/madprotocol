# Slither Removed Items

# arbitrary-send-erc20

> Items Found: 2

_Item 1 / 2_

## Severity

**Impact:** High

**Likelihood:** High

## Description


 [ERC721Lazy._paymentCheck(address,uint8)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/lib/tokens/ERC721/Impl/ERC721Lazy.sol#L470-L495) uses arbitrary from in transferFrom: [SafeTransferLib.safeTransferFrom(erc20,_erc20Owner,address(this),value)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/lib/tokens/ERC721/Impl/ERC721Lazy.sol#L487-L492)


## Reason removed

erc20 is the erc20 token payment address set by the owner. and is by design.

---

_Item 2 / 2_

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [ERC1155Lazy._paymentCheck(address,uint8)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/lib/tokens/ERC1155/Impl/ERC1155Lazy.sol#L577-L602) uses arbitrary from in transferFrom: [SafeTransferLib.safeTransferFrom(erc20,_erc20Owner,address(this),value)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/lib/tokens/ERC1155/Impl/ERC1155Lazy.sol#L594-L599)


## Reason removed

erc20 is the erc20 token payment address set by the owner. and is by design.

---

# uninitialized-state

> Items Found: 20

_Item 1,17 / 20_

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADRouter721.recipient](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter721.sol#L56) is never initialized. It is used in:
	- [MADRouter721.withdraw(address,ERC20)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter721.sol#L374-L442)
	- [MADRouter721.setRecipient(address)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter721.sol#L577-L585)

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADRouter1155.recipient](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter1155.sol#L50) is never initialized. It is used in:
	- [MADRouter1155.setRecipient(address)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter1155.sol#L107-L115)
	- [MADRouter1155.withdraw(address,ERC20)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter1155.sol#L487-L555)


## Reason removed

`recipient` is initialised in the function `setRecipient()` via the constructor. 

[MADRouter721.sol#L97](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter721.sol#L97)

[MADRouter721.sol#L577](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter721.sol#L577)

[MADRouter1155.sol#L98](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter1155.sol#L98)

[MADRouter1155.sol#L107](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADRouter1155.sol#L107)

```js

    /// @dev Setter for public mint fee _recipient.
    /// @dev Function Sighash := ?
    function setRecipient(address _recipient) public onlyOwner {
        require(_recipient != address(0), "Invalid address");

        assembly {
            sstore(recipient.slot, _recipient)
        }

        emit RecipientUpdated(_recipient);
    }

```

---

_Item 2,4 / 20_

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADFactory1155.market](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory1155.sol#L79) is never initialized. It is used in:
	- [MADFactory1155.setMarket(address)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory1155.sol#L508-L515)
	- [MADFactory1155._isMarket()](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory1155.sol#L752-L759)

## Severity

**Impact:** High

**Likelihood:** High

## Description

[MADFactory721.market](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory721.sol#L79) is never initialized. It is used in:
	- [MADFactory721.setMarket(address)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory721.sol#L520-L528)
	- [MADFactory721._isMarket()](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory721.sol#L766-L773)

## Reason Removed

`market` is initialised in the function `setMarket()` via the constructor. [MADFactory721.sol#L99](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory721.sol#L99)

[MADFactory721.sol#L520-L528](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory721.sol#L520-L528)

`market` is initialised in the function `setMarket()` via the constructor. [MADFactory1155.sol#L99](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory1155.sol#L99)

[MADFactory1155.sol#L508-L515](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADFactory1155.sol#L508-L515)


```js

    /// @dev `MADMarketplace` instance setter.
    /// @dev Function Sighash := 
    function setMarket(address _market) public onlyOwner {
        require(_market != address(0), "Invalid address");
        assembly {
            sstore(market.slot, _market)
        }

        emit MarketplaceUpdated(_market);
    }
```

---

_Items 5,12 / 20_

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADMarketplace721.minOrderDuration](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L70) is never initialized. It is used in:
	- [MADMarketplace721.updateSettings(uint256,uint256,uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L485-L519)
	- [MADMarketplace721._makeOrderChecks(uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L1098-L1137)


## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADMarketplace1155.minOrderDuration](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L70) is never initialized. It is used in:
	- [MADMarketplace1155.updateSettings(uint256,uint256,uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L507-L541)
	- [MADMarketplace1155._makeOrderChecks(uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L1170-L1209)


## Reason Removed

`minOrderDuration` is initialised in the function `updateSettings()` via the constructor. 

[MADMarketplace1155.sol#L111](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L111)

[MADMarketplace1155.sol#L507-L541](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L507-L541)

```js

    function updateSettings(
        uint256 _minAuctionIncrement,
        uint256 _minOrderDuration,
        uint256 _minBidValue,
        uint256 _maxOrderDuration
    ) public onlyOwner {
    // {...}
        assembly {
            sstore(minOrderDuration.slot, _minOrderDuration)
            sstore(
                minAuctionIncrement.slot,
                _minAuctionIncrement
            )
            sstore(minBidValue.slot, _minBidValue)
            sstore(maxOrderDuration.slot, _maxOrderDuration)
        }
    }
```

---


_Item 6,18 / 20_

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADMarketplace721.feeSelector](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L67-L68) is never initialized. It is used in:
	- [MADMarketplace721.buy(bytes32)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L263-L348)
	- [MADMarketplace721.claim(bytes32)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L353-L416)
	- [MADMarketplace721._feeResolver(uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L1034-L1054)

## Severity

**Impact:** High

**Likelihood:** High

## Description

 [MADMarketplace1155.feeSelector](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L67-L68) is never initialized. It is used in:
	- [MADMarketplace1155.buy(bytes32)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L281-L361)
	- [MADMarketplace1155.claim(bytes32)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L366-L427)
	- [MADMarketplace1155._feeResolver(uint256,uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L1102-L1126)

## Reason Removed

`feeSelector` is used whilst resolving control flow for inhouse minted tokens (*i.e.*, nfts minted within the plataform) for both `buy()` and `claim()` functions, its value gets updated once by the `_feeResolver()` function, once it gets called internally by `_intPath()`.  


[MADMarketplace721.sol#L859](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L859)

[MADMarketplace721.sol#L1034-L1054](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L1034-L1054)

[MADMarketplace1155.sol#L904](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L904)

[MADMarketplace1155.sol#L1102-L1126](https://github.com/madnfts/madnfts-solidity-contracts/blob/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace1155.sol#L1102-L1126)

```js
    function _intPath(
        Types.Order721 storage _order,
        uint256 _price,
        bytes32 _orderId,
        address _to,
        uint256 key
    ) internal {
        // load royalty info query to mem
        uint16 feePercent = _feeResolver(key, _order.tokenId);
    // {...}
    }
```

```js
    function _feeResolver(uint256 _key, uint256 _tokenId)
        internal
        returns (uint16 _feePercent)
    {
        assembly {
            mstore(0x00, _key)
            mstore(0x20, feeSelector.slot)
            let x := keccak256(0x00, 0x40)
            mstore(0x20, x)
            mstore(0x00, _tokenId)
            let y := keccak256(0x00, 0x40)
            /// @audit checked here
            switch sload(y) 
            case 0 {
                /// @audit updated if uninitialized
                sstore(y, 1) 
                _feePercent := sload(feeVal2.slot)
            }
            case 1 {
                _feePercent := sload(feeVal3.slot)
            }
        }
    }
```

---


_Item 3,10,11,16 / 20_

## Severity

**Impact:** High

**Likelihood:** High

## Description

**EXAMPLE:** 

 [MADMarketplace721.maxOrderDuration](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L71) is never initialized. It is used in:
	- [MADMarketplace721.updateSettings(uint256,uint256,uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L485-L519)
	- [MADMarketplace721._makeOrderChecks(uint256,uint256)](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3/contracts/MADMarketplace721.sol#L1098-L1137)

## Reason removed

initial value is hardcoded with optional function `updateSettings()` by design.

---

