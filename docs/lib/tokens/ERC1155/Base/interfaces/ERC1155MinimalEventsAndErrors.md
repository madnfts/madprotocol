# ERC1155MinimalEventsAndErrors










## Events

### PublicMintStateSet

```solidity
event PublicMintStateSet(bool indexed newPublicMintState)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newPublicMintState `indexed` | bool | undefined |

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

### AlreadyMinted

```solidity
error AlreadyMinted()
```



*0xddefae28*


### InvalidId

```solidity
error InvalidId()
```



*0xdfa1a408*


### NotMinted

```solidity
error NotMinted()
```



*0x4d5e5fb3*


### PublicMintOff

```solidity
error PublicMintOff()
```



*0x50eb1142*


### WrongPrice

```solidity
error WrongPrice()
```



*0xf7760f25*



