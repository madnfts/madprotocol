# MockERC2981









## Methods

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### royaltyInfo

```solidity
function royaltyInfo(uint256, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| salePrice | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| receiver | address | undefined |
| royaltyAmount | uint256 | undefined |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### setRoyaltyFee

```solidity
function setRoyaltyFee(uint256 fee) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| fee | uint256 | undefined |

### setRoyaltyRecipient

```solidity
function setRoyaltyRecipient(address recipient) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### OwnerUpdated

```solidity
event OwnerUpdated(address indexed user, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

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



