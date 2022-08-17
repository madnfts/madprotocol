# IERC721









## Methods

### approve

```solidity
function approve(address _approved, uint256 _tokenId) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _approved | address | undefined |
| _tokenId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getApproved

```solidity
function getApproved(uint256 _tokenId) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address _owner, address _operator) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |
| _operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### ownerOf

```solidity
function ownerOf(uint256 _tokenId) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | undefined |
| _to | address | undefined |
| _tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | undefined |
| _to | address | undefined |
| _tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address _operator, bool _approved) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _operator | address | undefined |
| _approved | bool | undefined |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _tokenId) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | undefined |
| _to | address | undefined |
| _tokenId | uint256 | undefined |



## Events

### Approval

```solidity
event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _approved `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _operator `indexed` | address | undefined |
| _approved  | bool | undefined |

### Transfer

```solidity
event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _from `indexed` | address | undefined |
| _to `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |



