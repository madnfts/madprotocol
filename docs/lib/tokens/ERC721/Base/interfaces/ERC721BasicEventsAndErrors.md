# ERC721BasicEventsAndErrors










## Events

### BaseURILocked

```solidity
event BaseURILocked(string indexed baseURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| baseURI `indexed` | string | undefined |

### BaseURISet

```solidity
event BaseURISet(string indexed newBaseURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newBaseURI `indexed` | string | undefined |

### PublicMintStateSet

```solidity
event PublicMintStateSet(bool indexed newPublicState)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newPublicState `indexed` | bool | undefined |

### RoyaltyFeeSet

```solidity
event RoyaltyFeeSet(uint256 indexed newRoyaltyFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newRoyaltyFee `indexed` | uint256 | undefined |

### RoyaltyRecipientSet

```solidity
event RoyaltyRecipientSet(address indexed newRecipient)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newRecipient `indexed` | address | undefined |



## Errors

### LoopOverflow

```solidity
error LoopOverflow()
```



*0xdfb035c9*


### MaxSupplyReached

```solidity
error MaxSupplyReached()
```



*0xd05cb609*


### NotMintedYet

```solidity
error NotMintedYet()
```



*0xbad086ea*


### PublicMintClosed

```solidity
error PublicMintClosed()
```



*0x2d0a3f8e*


### UriLocked

```solidity
error UriLocked()
```



*?*


### WrongPrice

```solidity
error WrongPrice()
```



*0xf7760f25*



