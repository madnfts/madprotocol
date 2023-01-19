# MADMarketplace721









## Methods

### MADFactory721

```solidity
function MADFactory721() external view returns (contract FactoryVerifier)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract FactoryVerifier | undefined |

### basisPoints

```solidity
function basisPoints() external view returns (uint16)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16 | undefined |

### bid

```solidity
function bid(bytes32 _order) external payable
```

Bidding function available for English Auction only.

*Function Signature := 0x957bb1e0By default, bids must be at least 5% higher than the previous one.By default, auction will be extended in 5 minutes if last bid is placed 5 minutes prior to auction&#39;s end.5 minutes eq to 300 mined blocks since block mining time is expected to take 1s in the harmony blockchain.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _order | bytes32 | undefined |

### buy

```solidity
function buy(bytes32 _order) external payable
```

Enables user to buy an nft for both Fixed Price and Dutch Auction listings.

*Price overrunning not accepted in fixed price and dutch auction.Function Signature := 0x9c9a1061*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _order | bytes32 | undefined |

### cancelOrder

```solidity
function cancelOrder(bytes32 _order) external nonpayable
```

Enables sellers to withdraw their tokens.

*Function Signature := 0x7489ec23Cancels order setting endTime value to 0.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _order | bytes32 | undefined |

### claim

```solidity
function claim(bytes32 _order) external nonpayable
```

Pull method for NFT withdrawing in English Auction.

*Function Signature := 0xbd66528aCallable by both the seller and the auction winner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _order | bytes32 | undefined |

### delOrder

```solidity
function delOrder(bytes32 hash, contract IERC721 _token, uint256 _id, address _seller) external nonpayable
```

Delete order function only callabe by contract&#39;s owner, when contract is paused, as security measure.

*Function Signature := 0x0c026db9*

#### Parameters

| Name | Type | Description |
|---|---|---|
| hash | bytes32 | undefined |
| _token | contract IERC721 | undefined |
| _id | uint256 | undefined |
| _seller | address | undefined |

### dutchAuction

```solidity
function dutchAuction(contract IERC721 _token, uint256 _id, uint256 _startPrice, uint256 _endPrice, uint256 _endTime) external nonpayable
```

Dutch Auction listing order public pusher.

*Function Signature := 0x205e409c*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract IERC721 | undefined |
| _id | uint256 | undefined |
| _startPrice | uint256 | undefined |
| _endPrice | uint256 | undefined |
| _endTime | uint256 | undefined |

### englishAuction

```solidity
function englishAuction(contract IERC721 _token, uint256 _id, uint256 _startPrice, uint256 _endTime) external nonpayable
```

English Auction listing order public pusher.

*Function Signature := 0x47c4be17*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract IERC721 | undefined |
| _id | uint256 | undefined |
| _startPrice | uint256 | undefined |
| _endTime | uint256 | undefined |

### erc20

```solidity
function erc20() external view returns (contract ERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ERC20 | undefined |

### feeSelector

```solidity
function feeSelector(uint256, uint256) external view returns (bool)
```



*token =&gt; tokenId =&gt; case0(feePercent0)/case1(feePercent1)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### feeVal2

```solidity
function feeVal2() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### feeVal3

```solidity
function feeVal3() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### fixedPrice

```solidity
function fixedPrice(contract IERC721 _token, uint256 _id, uint256 _price, uint256 _endTime) external nonpayable
```

Fixed Price listing order public pusher.

*Function Signature := 0x40b78b0f*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract IERC721 | undefined |
| _id | uint256 | undefined |
| _price | uint256 | undefined |
| _endTime | uint256 | undefined |

### getCurrentPrice

```solidity
function getCurrentPrice(bytes32 _order) external view returns (uint256 price)
```

Works as price fetcher of listed tokens

*Function Signature := 0x161e444eUsed for price fetching in buy function.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _order | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| price | uint256 | undefined |

### maxOrderDuration

```solidity
function maxOrderDuration() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### minAuctionIncrement

```solidity
function minAuctionIncrement() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### minBidValue

```solidity
function minBidValue() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### minOrderDuration

```solidity
function minOrderDuration() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### name

```solidity
function name() external pure returns (string)
```



*Function Signature := 0x06fdde03*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) external nonpayable returns (bytes4)
```



*Implementation of the {ERC721Receiver} abstract contract. Accepts all token transfers. Make sure the contract is able to use its token with {IERC721-safeTransferFrom}, {IERC721-approve} or {IERC721-setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |
| _3 | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined |

### orderIdBySeller

```solidity
function orderIdBySeller(address, uint256) external view returns (bytes32)
```



*seller =&gt; orderID*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### orderIdByToken

```solidity
function orderIdByToken(contract IERC721, uint256, uint256) external view returns (bytes32)
```



*token =&gt; id =&gt; orderID[]*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC721 | undefined |
| _1 | uint256 | undefined |
| _2 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### orderInfo

```solidity
function orderInfo(bytes32) external view returns (uint256 tokenId, uint256 startPrice, uint256 endPrice, uint256 startTime, uint256 endTime, uint256 lastBidPrice, address lastBidder, contract IERC721 token, address seller, uint8 orderType, bool isSold)
```



*orderID =&gt; order details*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| startPrice | uint256 | undefined |
| endPrice | uint256 | undefined |
| startTime | uint256 | undefined |
| endTime | uint256 | undefined |
| lastBidPrice | uint256 | undefined |
| lastBidder | address | undefined |
| token | contract IERC721 | undefined |
| seller | address | undefined |
| orderType | uint8 | undefined |
| isSold | bool | undefined |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### pause

```solidity
function pause() external nonpayable
```

Paused state initializer for security risk mitigation pratice.

*Function Signature := 0x8456cb59*


### paused

```solidity
function paused() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### recipient

```solidity
function recipient() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### sellerOrderLength

```solidity
function sellerOrderLength(address _seller) external view returns (uint256)
```

Everything in storage can be fetch through the getters natively provided by all public mappings.

*This public getter serve as a hook to ease frontend fetching whilst estimating `orderIdBySeller` indexes by length.Function Signature := 0x8aae982a*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _seller | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### setFactory

```solidity
function setFactory(contract FactoryVerifier _factory) external nonpayable
```



*`MADFactory` instance setter.Function Signature := 0x612990fe*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _factory | contract FactoryVerifier | undefined |

### setFees

```solidity
function setFees(uint256 _feeVal2, uint256 _feeVal3) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeVal2 | uint256 | undefined |
| _feeVal3 | uint256 | undefined |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```



*Function Signature := 0x13af4035*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### setPaymentToken

```solidity
function setPaymentToken(address _paymentTokenAddress) external nonpayable
```

Enables the contract&#39;s owner to change payment token address.

*Function Signature := ?*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _paymentTokenAddress | address | undefined |

### setRecipient

```solidity
function setRecipient(address _recipient) external nonpayable
```

Enables the contract&#39;s owner to change recipient address.

*Function Signature := 0x3bbed4a0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipient | address | undefined |

### tokenOrderLength

```solidity
function tokenOrderLength(contract IERC721 _token, uint256 _id) external view returns (uint256)
```

Everything in storage can be fetch through the getters natively provided by all public mappings.

*This public getter serve as a hook to ease frontend fetching whilst estimating `orderIdByToken` indexes by length.Function Signature := 0x8c5ac795*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract IERC721 | undefined |
| _id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### unpause

```solidity
function unpause() external nonpayable
```

Unpaused state initializer for security risk mitigation pratice.

*Function Signature := 0x3f4ba83a*


### updateSettings

```solidity
function updateSettings(uint256 _minAuctionIncrement, uint256 _minOrderDuration, uint256 _minBidValue, uint256 _maxOrderDuration) external nonpayable
```

Marketplace config setter.

*Function Signature := 0x0465c563Time tracking criteria based on `blocknumber`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _minAuctionIncrement | uint256 | Min. time threshold for Auction extension. |
| _minOrderDuration | uint256 | Min. order listing duration |
| _minBidValue | uint256 | Min. value for a bid to be considered. |
| _maxOrderDuration | uint256 | undefined |

### withdraw

```solidity
function withdraw() external nonpayable
```



*Function Signature := 0x3ccfd60b*


### withdrawERC20

```solidity
function withdrawERC20(contract ERC20 _token) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract ERC20 | undefined |



## Events

### AuctionSettingsUpdated

```solidity
event AuctionSettingsUpdated(uint256 indexed newMinDuration, uint256 indexed newIncrement, uint256 newMinBidValue, uint256 indexed newMaxDuration)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newMinDuration `indexed` | uint256 | undefined |
| newIncrement `indexed` | uint256 | undefined |
| newMinBidValue  | uint256 | undefined |
| newMaxDuration `indexed` | uint256 | undefined |

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

### FeesUpdated

```solidity
event FeesUpdated(uint256 feeVal2, uint256 feeVal3)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| feeVal2  | uint256 | undefined |
| feeVal3  | uint256 | undefined |

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

### OwnerUpdated

```solidity
event OwnerUpdated(address indexed user, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### PaymentTokenUpdated

```solidity
event PaymentTokenUpdated(address indexed newPaymentToken)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newPaymentToken `indexed` | address | undefined |

### RecipientUpdated

```solidity
event RecipientUpdated(address indexed newRecipient)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newRecipient `indexed` | address | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |



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



