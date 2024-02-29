# ERC721MinimalEventsAndErrors

## Events

### PublicMintStateSet

```solidity
event PublicMintStateSet(bool indexed newPublicMintState)
```

#### Parameters

| Name                         | Type | Description |
| ---------------------------- | ---- | ----------- |
| newPublicMintState `indexed` | bool | undefined   |

### RoyaltyFeeSet

```solidity
event RoyaltyFeeSet(uint256 indexed newRoyaltyFee)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| newRoyaltyFee `indexed` | uint256 | undefined   |

### RoyaltyRecipientSet

```solidity
event RoyaltyRecipientSet(address indexed newRecipient)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newRecipient `indexed` | address | undefined   |

## Errors

### AlreadyMinted

```solidity
error AlreadyMinted()
```

_0xddefae28_

### InvalidId

```solidity
error InvalidId()
```

_0xdfa1a408_

### NotMinted

```solidity
error NotMinted()
```

_0x4d5e5fb3_

### PublicMintOff

```solidity
error PublicMintOff()
```

_0x50eb1142_

### WrongPrice

```solidity
error WrongPrice()
```

_0xf7760f25_
