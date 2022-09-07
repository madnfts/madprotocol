# MADMarketplace1155

## Methods

### MADFactory1155

```solidity
function MADFactory1155() external view returns (contract FactoryVerifier)
```

#### Returns

| Name | Type                     | Description |
| ---- | ------------------------ | ----------- |
| \_0  | contract FactoryVerifier | undefined   |

### basisPoints

```solidity
function basisPoints() external view returns (uint16)
```

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | uint16 | undefined   |

### bid

```solidity
function bid(bytes32 _order) external payable
```

Bidding function available for English Auction only.

_Function Signature := 0x957bb1e0By default, bids must be at least 5% higher than the previous one.By default, auction will be extended in 5 minutes if last bid is placed 5 minutes prior to auction&#39;s end.5 minutes eq to 300 mined blocks since block mining time is expected to take 1s in the harmony blockchain._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_order | bytes32 | undefined   |

### buy

```solidity
function buy(bytes32 _order) external payable
```

Enables user to buy an nft for both Fixed Price and Dutch Auction listings.

_Price overrunning not accepted in fixed price and dutch auction.Function Signature := 0x9c9a1061_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_order | bytes32 | undefined   |

### cancelOrder

```solidity
function cancelOrder(bytes32 _order) external nonpayable
```

Enables sellers to withdraw their tokens.

_Function Signature := 0x7489ec23Cancels order setting endBlock value to 0._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_order | bytes32 | undefined   |

### claim

```solidity
function claim(bytes32 _order) external nonpayable
```

Pull method for NFT withdrawing in English Auction.

_Function Signature := 0xbd66528aCallable by both the seller and the auction winner._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_order | bytes32 | undefined   |

### delOrder

```solidity
function delOrder(bytes32 hash, contract IERC1155 _token, uint256 _id, uint256 _amount, address _seller) external nonpayable
```

Delete order function only callabe by contract&#39;s owner, when contract is paused, as security measure.

_Function Signature := 0x0c026db9_

#### Parameters

| Name     | Type              | Description |
| -------- | ----------------- | ----------- |
| hash     | bytes32           | undefined   |
| \_token  | contract IERC1155 | undefined   |
| \_id     | uint256           | undefined   |
| \_amount | uint256           | undefined   |
| \_seller | address           | undefined   |

### dutchAuction

```solidity
function dutchAuction(contract IERC1155 _token, uint256 _id, uint256 _amount, uint256 _startPrice, uint256 _endPrice, uint256 _endBlock) external nonpayable
```

Dutch Auction listing order public pusher.

_Function Signature := 0x205e409c_

#### Parameters

| Name         | Type              | Description |
| ------------ | ----------------- | ----------- |
| \_token      | contract IERC1155 | undefined   |
| \_id         | uint256           | undefined   |
| \_amount     | uint256           | undefined   |
| \_startPrice | uint256           | undefined   |
| \_endPrice   | uint256           | undefined   |
| \_endBlock   | uint256           | undefined   |

### englishAuction

```solidity
function englishAuction(contract IERC1155 _token, uint256 _id, uint256 _amount, uint256 _startPrice, uint256 _endBlock) external nonpayable
```

English Auction listing order public pusher.

_Function Signature := 0x47c4be17_

#### Parameters

| Name         | Type              | Description |
| ------------ | ----------------- | ----------- |
| \_token      | contract IERC1155 | undefined   |
| \_id         | uint256           | undefined   |
| \_amount     | uint256           | undefined   |
| \_startPrice | uint256           | undefined   |
| \_endBlock   | uint256           | undefined   |

### feePercent0

```solidity
function feePercent0() external view returns (uint16)
```

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | uint16 | undefined   |

### feePercent1

```solidity
function feePercent1() external view returns (uint16)
```

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | uint16 | undefined   |

### feeSelector

```solidity
function feeSelector(uint256, uint256, uint256) external view returns (bool)
```

_token =&gt; tokenId =&gt; amount =&gt; case0(feePercent0)/case1(feePercent1)_

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |
| \_1  | uint256 | undefined   |
| \_2  | uint256 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### fixedPrice

```solidity
function fixedPrice(contract IERC1155 _token, uint256 _id, uint256 _amount, uint256 _price, uint256 _endBlock) external nonpayable
```

Fixed Price listing order public pusher.

_Function Signature := 0x40b78b0f_

#### Parameters

| Name       | Type              | Description |
| ---------- | ----------------- | ----------- |
| \_token    | contract IERC1155 | undefined   |
| \_id       | uint256           | undefined   |
| \_amount   | uint256           | undefined   |
| \_price    | uint256           | undefined   |
| \_endBlock | uint256           | undefined   |

### getCurrentPrice

```solidity
function getCurrentPrice(bytes32 _order) external view returns (uint256 price)
```

Works as price fetcher of listed tokens

_Function Signature := 0x161e444eUsed for price fetching in buy function._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_order | bytes32 | undefined   |

#### Returns

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| price | uint256 | undefined   |

### minAuctionIncrement

```solidity
function minAuctionIncrement() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### minBidValue

```solidity
function minBidValue() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### minOrderDuration

```solidity
function minOrderDuration() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### name

```solidity
function name() external pure returns (string)
```

_Function Signature := 0x06fdde03_

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### onERC1155BatchReceived

```solidity
function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) external nonpayable returns (bytes4)
```

#### Parameters

| Name | Type      | Description |
| ---- | --------- | ----------- |
| \_0  | address   | undefined   |
| \_1  | address   | undefined   |
| \_2  | uint256[] | undefined   |
| \_3  | uint256[] | undefined   |
| \_4  | bytes     | undefined   |

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | bytes4 | undefined   |

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external nonpayable returns (bytes4)
```

_Implementation of the {ERC1155TokenReceiver} abstract contract that allows a contract to hold ERC1155 tokens._

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | address | undefined   |
| \_2  | uint256 | undefined   |
| \_3  | uint256 | undefined   |
| \_4  | bytes   | undefined   |

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | bytes4 | undefined   |

### orderIdBySeller

```solidity
function orderIdBySeller(address, uint256) external view returns (bytes32)
```

_seller =&gt; orderID_

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### orderIdByToken

```solidity
function orderIdByToken(contract IERC1155, uint256, uint256, uint256) external view returns (bytes32)
```

_token =&gt; id =&gt; amount =&gt; orderID[]_

#### Parameters

| Name | Type              | Description |
| ---- | ----------------- | ----------- |
| \_0  | contract IERC1155 | undefined   |
| \_1  | uint256           | undefined   |
| \_2  | uint256           | undefined   |
| \_3  | uint256           | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### orderInfo

```solidity
function orderInfo(bytes32) external view returns (uint256 tokenId, uint256 amount, uint256 startPrice, uint256 endPrice, uint256 startBlock, uint256 endBlock, uint256 lastBidPrice, address lastBidder, contract IERC1155 token, address seller, uint8 orderType, bool isSold)
```

_orderID =&gt; order details_

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

#### Returns

| Name         | Type              | Description |
| ------------ | ----------------- | ----------- |
| tokenId      | uint256           | undefined   |
| amount       | uint256           | undefined   |
| startPrice   | uint256           | undefined   |
| endPrice     | uint256           | undefined   |
| startBlock   | uint256           | undefined   |
| endBlock     | uint256           | undefined   |
| lastBidPrice | uint256           | undefined   |
| lastBidder   | address           | undefined   |
| token        | contract IERC1155 | undefined   |
| seller       | address           | undefined   |
| orderType    | uint8             | undefined   |
| isSold       | bool              | undefined   |

### owner

```solidity
function owner() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### pause

```solidity
function pause() external nonpayable
```

Paused state initializer for security risk mitigation pratice.

_Function Signature := 0x8456cb59_

### paused

```solidity
function paused() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### recipient

```solidity
function recipient() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### sellerOrderLength

```solidity
function sellerOrderLength(address _seller) external view returns (uint256)
```

Everything in storage can be fetch through the getters natively provided by all public mappings.

_This public getter serve as a hook to ease frontend fetching whilst estimating `orderIdBySeller` indexes by length.Function Signature := 0x8aae982a_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_seller | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### setFactory

```solidity
function setFactory(contract FactoryVerifier _factory) external nonpayable
```

_`MADFactory` instance setter.Function Signature := 0x612990fe_

#### Parameters

| Name      | Type                     | Description |
| --------- | ------------------------ | ----------- |
| \_factory | contract FactoryVerifier | undefined   |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```

_Function Signature := 0x13af4035_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### setRecipient

```solidity
function setRecipient(address _recipient) external nonpayable
```

Enables the contract&#39;s owner to change recipient address.

_Function Signature := 0x3bbed4a0_

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_recipient | address | undefined   |

### tokenOrderLength

```solidity
function tokenOrderLength(contract IERC1155 _token, uint256 _id, uint256 _amount) external view returns (uint256)
```

Everything in storage can be fetch through the getters natively provided by all public mappings.

_This public getter serve as a hook to ease frontend fetching whilst estimating `orderIdByToken` indexes by length.Function Signature := 0x8c5ac795_

#### Parameters

| Name     | Type              | Description |
| -------- | ----------------- | ----------- |
| \_token  | contract IERC1155 | undefined   |
| \_id     | uint256           | undefined   |
| \_amount | uint256           | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### unpause

```solidity
function unpause() external nonpayable
```

Unpaused state initializer for security risk mitigation pratice.

_Function Signature := 0x3f4ba83a_

### updateSettings

```solidity
function updateSettings(uint256 _minAuctionIncrement, uint256 _minOrderDuration, uint256 _minBidValue) external nonpayable
```

Marketplace config setter.

_Function Signature := 0x0465c563Time tracking criteria based on `blocknumber`._

#### Parameters

| Name                  | Type    | Description                                |
| --------------------- | ------- | ------------------------------------------ |
| \_minAuctionIncrement | uint256 | Min. time threshold for Auction extension. |
| \_minOrderDuration    | uint256 | Min. order listing duration                |
| \_minBidValue         | uint256 | Min. value for a bid to be considered.     |

### withdraw

```solidity
function withdraw() external nonpayable
```

_Function Signature := 0x3ccfd60b_

## Events

### AuctionSettingsUpdated

```solidity
event AuctionSettingsUpdated(uint256 indexed newMinDuration, uint256 indexed newIncrement, uint256 indexed newMinBidValue)
```

#### Parameters

| Name                     | Type    | Description |
| ------------------------ | ------- | ----------- |
| newMinDuration `indexed` | uint256 | undefined   |
| newIncrement `indexed`   | uint256 | undefined   |
| newMinBidValue `indexed` | uint256 | undefined   |

### Bid

```solidity
event Bid(contract IERC1155 indexed token, uint256 id, uint256 amount, bytes32 indexed hash, address bidder, uint256 bidPrice)
```

#### Parameters

| Name            | Type              | Description |
| --------------- | ----------------- | ----------- |
| token `indexed` | contract IERC1155 | undefined   |
| id              | uint256           | undefined   |
| amount          | uint256           | undefined   |
| hash `indexed`  | bytes32           | undefined   |
| bidder          | address           | undefined   |
| bidPrice        | uint256           | undefined   |

### CancelOrder

```solidity
event CancelOrder(contract IERC1155 indexed token, uint256 id, uint256 amount, bytes32 indexed hash, address seller)
```

#### Parameters

| Name            | Type              | Description |
| --------------- | ----------------- | ----------- |
| token `indexed` | contract IERC1155 | undefined   |
| id              | uint256           | undefined   |
| amount          | uint256           | undefined   |
| hash `indexed`  | bytes32           | undefined   |
| seller          | address           | undefined   |

### Claim

```solidity
event Claim(contract IERC1155 indexed token, uint256 id, uint256 amount, bytes32 indexed hash, address seller, address taker, uint256 price)
```

#### Parameters

| Name            | Type              | Description |
| --------------- | ----------------- | ----------- |
| token `indexed` | contract IERC1155 | undefined   |
| id              | uint256           | undefined   |
| amount          | uint256           | undefined   |
| hash `indexed`  | bytes32           | undefined   |
| seller          | address           | undefined   |
| taker           | address           | undefined   |
| price           | uint256           | undefined   |

### FactoryUpdated

```solidity
event FactoryUpdated(contract FactoryVerifier indexed newFactory)
```

#### Parameters

| Name                 | Type                     | Description |
| -------------------- | ------------------------ | ----------- |
| newFactory `indexed` | contract FactoryVerifier | undefined   |

### MakeOrder

```solidity
event MakeOrder(contract IERC1155 indexed token, uint256 id, uint256 amount, bytes32 indexed hash, address seller)
```

#### Parameters

| Name            | Type              | Description |
| --------------- | ----------------- | ----------- |
| token `indexed` | contract IERC1155 | undefined   |
| id              | uint256           | undefined   |
| amount          | uint256           | undefined   |
| hash `indexed`  | bytes32           | undefined   |
| seller          | address           | undefined   |

### OwnerUpdated

```solidity
event OwnerUpdated(address indexed user, address indexed newOwner)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| user `indexed`     | address | undefined   |
| newOwner `indexed` | address | undefined   |

### Paused

```solidity
event Paused(address account)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

### RecipientUpdated

```solidity
event RecipientUpdated(address indexed newRecipient)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newRecipient `indexed` | address | undefined   |

### Unpaused

```solidity
event Unpaused(address account)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

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
