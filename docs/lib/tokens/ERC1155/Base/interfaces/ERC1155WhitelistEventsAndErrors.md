# ERC1155WhitelistEventsAndErrors










## Events

### BaseURISet

```solidity
event BaseURISet(string indexed newBaseURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newBaseURI `indexed` | string | undefined |

### FreeClaimStateSet

```solidity
event FreeClaimStateSet(bool indexed freeClaimState)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| freeClaimState `indexed` | bool | undefined |

### FreeConfigSet

```solidity
event FreeConfigSet(uint256 newFreeAmount, uint256 indexed newMaxFree, bytes32 indexed newMerkleRoot)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFreeAmount  | uint256 | undefined |
| newMaxFree `indexed` | uint256 | undefined |
| newMerkleRoot `indexed` | bytes32 | undefined |

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

### WhitelistConfigSet

```solidity
event WhitelistConfigSet(uint256 indexed newWhitelistPrice, uint256 indexed newMaxWhitelistSupply, bytes32 indexed newMerkleRoot)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newWhitelistPrice `indexed` | uint256 | undefined |
| newMaxWhitelistSupply `indexed` | uint256 | undefined |
| newMerkleRoot `indexed` | bytes32 | undefined |

### WhitelistMintStateSet

```solidity
event WhitelistMintStateSet(bool indexed newWhitelistState)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newWhitelistState `indexed` | bool | undefined |



## Errors

### AddressDenied

```solidity
error AddressDenied()
```



*0x3b8474be*


### AlreadyClaimed

```solidity
error AlreadyClaimed()
```



*0x646cf558*


### FreeClaimClosed

```solidity
error FreeClaimClosed()
```



*0xf44170cb*


### LoopOverflow

```solidity
error LoopOverflow()
```



*0xdfb035c9*


### MaxFreeReached

```solidity
error MaxFreeReached()
```



*0xf90c1bdb*


### MaxMintReached

```solidity
error MaxMintReached()
```



*0xfc3fc71f*


### MaxWhitelistReached

```solidity
error MaxWhitelistReached()
```



*0xa554e6e1*


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


### WhitelistMintClosed

```solidity
error WhitelistMintClosed()
```



*0x700a6c1f*


### WrongPrice

```solidity
error WrongPrice()
```



*0xf7760f25*



