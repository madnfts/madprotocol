# MarketplaceEventsAndErrors










## Events

### AuctionSettingsUpdated

```solidity
event AuctionSettingsUpdated(uint256 indexed newMinDuration, uint256 indexed newIncrement, uint256 indexed newMinBidValue)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newMinDuration `indexed` | uint256 | undefined |
| newIncrement `indexed` | uint256 | undefined |
| newMinBidValue `indexed` | uint256 | undefined |

### Bid

```solidity
event Bid(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address bidder, uint256 bidPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | contract IERC721 | undefined |
| id  | uint256 | undefined |
| hash `indexed` | bytes32 | undefined |
| bidder  | address | undefined |
| bidPrice  | uint256 | undefined |

### CancelOrder

```solidity
event CancelOrder(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | contract IERC721 | undefined |
| id  | uint256 | undefined |
| hash `indexed` | bytes32 | undefined |
| seller  | address | undefined |

### Claim

```solidity
event Claim(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address taker, uint256 price)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | contract IERC721 | undefined |
| id  | uint256 | undefined |
| hash `indexed` | bytes32 | undefined |
| seller  | address | undefined |
| taker  | address | undefined |
| price  | uint256 | undefined |

### FactoryUpdated

```solidity
event FactoryUpdated(contract FactoryVerifier indexed newFactory)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFactory `indexed` | contract FactoryVerifier | undefined |

### MakeOrder

```solidity
event MakeOrder(contract IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | contract IERC721 | undefined |
| id  | uint256 | undefined |
| hash `indexed` | bytes32 | undefined |
| seller  | address | undefined |



## Errors

### AccessDenied

```solidity
error AccessDenied()
```



*0x4ca88867*


### BidExists

```solidity
error BidExists()
```



*0x3e0827ab*


### CanceledOrder

```solidity
error CanceledOrder()
```



*0xdf9428da*


### EAOnly

```solidity
error EAOnly()
```



*0xffc96cb0*


### ExceedsMaxEP

```solidity
error ExceedsMaxEP()
```



*0x70f8f33a*


### InvalidBidder

```solidity
error InvalidBidder()
```



*0x0863b103*


### NeedMoreTime

```solidity
error NeedMoreTime()
```



*0x921dbfec*


### NotBuyable

```solidity
error NotBuyable()
```



*0x07ae5744*


### SoldToken

```solidity
error SoldToken()
```



*0xf88b07a3*


### Timeout

```solidity
error Timeout()
```



*0x2af0c7f8*


### TransferFailed

```solidity
error TransferFailed()
```



*0x90b8ec18*


### WrongPrice

```solidity
error WrongPrice()
```



*0xf7760f25*



