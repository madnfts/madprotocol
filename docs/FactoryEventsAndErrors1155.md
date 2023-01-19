# FactoryEventsAndErrors1155










## Events

### ERC1155BasicCreated

```solidity
event ERC1155BasicCreated(address indexed newSplitter, address indexed newCollection, string name, string symbol, uint256 royalties, uint256 maxSupply, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newSplitter `indexed` | address | undefined |
| newCollection `indexed` | address | undefined |
| name  | string | undefined |
| symbol  | string | undefined |
| royalties  | uint256 | undefined |
| maxSupply  | uint256 | undefined |
| mintPrice  | uint256 | undefined |

### ERC1155LazyCreated

```solidity
event ERC1155LazyCreated(address indexed newSplitter, address indexed newCollection, string name, string symbol, uint256 royalties, uint256 maxSupply, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newSplitter `indexed` | address | undefined |
| newCollection `indexed` | address | undefined |
| name  | string | undefined |
| symbol  | string | undefined |
| royalties  | uint256 | undefined |
| maxSupply  | uint256 | undefined |
| mintPrice  | uint256 | undefined |

### ERC1155MinimalCreated

```solidity
event ERC1155MinimalCreated(address indexed newSplitter, address indexed newCollection, string name, string symbol, uint256 royalties, uint256 maxSupply, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newSplitter `indexed` | address | undefined |
| newCollection `indexed` | address | undefined |
| name  | string | undefined |
| symbol  | string | undefined |
| royalties  | uint256 | undefined |
| maxSupply  | uint256 | undefined |
| mintPrice  | uint256 | undefined |

### ERC1155WhitelistCreated

```solidity
event ERC1155WhitelistCreated(address indexed newSplitter, address indexed newCollection, string name, string symbol, uint256 royalties, uint256 maxSupply, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newSplitter `indexed` | address | undefined |
| newCollection `indexed` | address | undefined |
| name  | string | undefined |
| symbol  | string | undefined |
| royalties  | uint256 | undefined |
| maxSupply  | uint256 | undefined |
| mintPrice  | uint256 | undefined |

### MarketplaceUpdated

```solidity
event MarketplaceUpdated(address indexed newMarket)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newMarket `indexed` | address | undefined |

### PaymentTokenUpdated

```solidity
event PaymentTokenUpdated(address indexed newPaymentToken)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newPaymentToken `indexed` | address | undefined |

### RouterUpdated

```solidity
event RouterUpdated(address indexed newRouter)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newRouter `indexed` | address | undefined |

### SignerUpdated

```solidity
event SignerUpdated(address indexed newSigner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newSigner `indexed` | address | undefined |

### SplitterCreated

```solidity
event SplitterCreated(address indexed creator, uint256[] shares, address[] payees, address splitter, uint256 flag)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| creator `indexed` | address | undefined |
| shares  | uint256[] | undefined |
| payees  | address[] | undefined |
| splitter  | address | undefined |
| flag  | uint256 | undefined |



## Errors

### InvalidRoyalty

```solidity
error InvalidRoyalty()
```



*0xe0e54ced*


### SplitterFail

```solidity
error SplitterFail()
```



*0x00adecf0*



