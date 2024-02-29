# MarketplaceEventsAndErrors721

## Events

### AuctionSettingsUpdated

```solidity
event AuctionSettingsUpdated(uint256 indexed newMinDuration, uint256 indexed newIncrement, uint256 newMinBidValue, uint256 indexed newMaxDuration)
```

#### Parameters

| Name                     | Type    | Description |
| ------------------------ | ------- | ----------- |
| newMinDuration `indexed` | uint256 | undefined   |
| newIncrement `indexed`   | uint256 | undefined   |
| newMinBidValue           | uint256 | undefined   |
| newMaxDuration `indexed` | uint256 | undefined   |

### Bid

```solidity
event Bid(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address bidder, uint256 bidPrice)
```

#### Parameters

| Name            | Type             | Description |
| --------------- | ---------------- | ----------- |
| token `indexed` | contract IERC721 | undefined   |
| id              | uint256          | undefined   |
| hash `indexed`  | bytes32          | undefined   |
| bidder          | address          | undefined   |
| bidPrice        | uint256          | undefined   |

### CancelOrder

```solidity
event CancelOrder(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller)
```

#### Parameters

| Name            | Type             | Description |
| --------------- | ---------------- | ----------- |
| token `indexed` | contract IERC721 | undefined   |
| id              | uint256          | undefined   |
| hash `indexed`  | bytes32          | undefined   |
| seller          | address          | undefined   |

### Claim

```solidity
event Claim(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address taker, uint256 price)
```

#### Parameters

| Name            | Type             | Description |
| --------------- | ---------------- | ----------- |
| token `indexed` | contract IERC721 | undefined   |
| id              | uint256          | undefined   |
| hash `indexed`  | bytes32          | undefined   |
| seller          | address          | undefined   |
| taker           | address          | undefined   |
| price           | uint256          | undefined   |

### FactoryUpdated

```solidity
event FactoryUpdated(contract FactoryVerifier indexed newFactory)
```

#### Parameters

| Name                 | Type                     | Description |
| -------------------- | ------------------------ | ----------- |
| newFactory `indexed` | contract FactoryVerifier | undefined   |

### FeesUpdated

```solidity
event FeesUpdated(uint256 feeVal2, uint256 feeVal3)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| feeVal2 | uint256 | undefined   |
| feeVal3 | uint256 | undefined   |

### MakeOrder

```solidity
event MakeOrder(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller)
```

#### Parameters

| Name            | Type             | Description |
| --------------- | ---------------- | ----------- |
| token `indexed` | contract IERC721 | undefined   |
| id              | uint256          | undefined   |
| hash `indexed`  | bytes32          | undefined   |
| seller          | address          | undefined   |

### PaymentTokenUpdated

```solidity
event PaymentTokenUpdated(address indexed newPaymentToken)
```

#### Parameters

| Name                      | Type    | Description |
| ------------------------- | ------- | ----------- |
| newPaymentToken `indexed` | address | undefined   |

### RecipientUpdated

```solidity
event RecipientUpdated(address indexed newRecipient)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newRecipient `indexed` | address | undefined   |

## Errors

### AccessDenied

```solidity
error AccessDenied()
```

_0x4ca88867_

### BidExists

```solidity
error BidExists()
```

_0x3e0827ab_

### CanceledOrder

```solidity
error CanceledOrder()
```

_0xdf9428da_

### EAOnly

```solidity
error EAOnly()
```

_0xffc96cb0_

### ExceedsMaxEP

```solidity
error ExceedsMaxEP()
```

_0x70f8f33a_

### InvalidBidder

```solidity
error InvalidBidder()
```

_0x0863b103_

### NeedMoreTime

```solidity
error NeedMoreTime()
```

_0x921dbfec_

### NotBuyable

```solidity
error NotBuyable()
```

_0x07ae5744_

### SoldToken

```solidity
error SoldToken()
```

_0xf88b07a3_

### Timeout

```solidity
error Timeout()
```

_0x2af0c7f8_

### TransferFailed

```solidity
error TransferFailed()
```

_0x90b8ec18_

### WrongPrice

```solidity
error WrongPrice()
```

_0xf7760f25_
