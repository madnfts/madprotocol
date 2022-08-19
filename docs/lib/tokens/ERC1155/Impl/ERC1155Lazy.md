# ERC1155Lazy

## Methods

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### balanceOf

```solidity
function balanceOf(address owner, uint256 id) external view returns (uint256 bal)
```

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| owner | address | undefined   |
| id    | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| bal  | uint256 | undefined   |

### balanceOfBatch

```solidity
function balanceOfBatch(address[] owners, uint256[] ids) external view returns (uint256[] balances)
```

#### Parameters

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| owners | address[] | undefined   |
| ids    | uint256[] | undefined   |

#### Returns

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| balances | uint256[] | undefined   |

### burn

```solidity
function burn(uint256[] ids) external nonpayable
```

_Burns an arbitrary length array of ids of different owners._

#### Parameters

| Name | Type      | Description |
| ---- | --------- | ----------- |
| ids  | uint256[] | undefined   |

### burnBatch

```solidity
function burnBatch(address from, uint256[] ids) external nonpayable
```

_Burns an arbitrary length array of ids owned by a single account._

#### Parameters

| Name | Type      | Description |
| ---- | --------- | ----------- |
| from | address   | undefined   |
| ids  | uint256[] | undefined   |

### getURI

```solidity
function getURI() external view returns (string)
```

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### isApprovedForAll

```solidity
function isApprovedForAll(address, address) external view returns (bool)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### lazyMint

```solidity
function lazyMint(Types.Voucher voucher, uint8 v, bytes32 r, bytes32 s) external payable
```

#### Parameters

| Name    | Type          | Description |
| ------- | ------------- | ----------- |
| voucher | Types.Voucher | undefined   |
| v       | uint8         | undefined   |
| r       | bytes32       | undefined   |
| s       | bytes32       | undefined   |

### lazyMintBatch

```solidity
function lazyMintBatch(Types.UserBatch userBatch, uint8 v, bytes32 r, bytes32 s) external payable
```

#### Parameters

| Name      | Type            | Description |
| --------- | --------------- | ----------- |
| userBatch | Types.UserBatch | undefined   |
| v         | uint8           | undefined   |
| r         | bytes32         | undefined   |
| s         | bytes32         | undefined   |

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

### owner

```solidity
function owner() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### ownerOf

```solidity
function ownerOf(uint256) external view returns (address)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| tokenId   | uint256 | undefined   |
| salePrice | uint256 | undefined   |

#### Returns

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| receiver      | address | undefined   |
| royaltyAmount | uint256 | undefined   |

### safeBatchTransferFrom

```solidity
function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external nonpayable
```

#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| from    | address   | undefined   |
| to      | address   | undefined   |
| ids     | uint256[] | undefined   |
| amounts | uint256[] | undefined   |
| data    | bytes     | undefined   |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external nonpayable
```

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| from   | address | undefined   |
| to     | address | undefined   |
| id     | uint256 | undefined   |
| amount | uint256 | undefined   |
| data   | bytes   | undefined   |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| operator | address | undefined   |
| approved | bool    | undefined   |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### setSigner

```solidity
function setSigner(address _signer) external nonpayable
```

_Can only be updated by the Router&#39;s owner._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_signer | address | undefined   |

### setURI

```solidity
function setURI(string __uri) external nonpayable
```

Changes the `_uri` value in storage.

_Can only be accessed by the collection creator._

#### Parameters

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| \_\_uri | string | undefined   |

### splitter

```solidity
function splitter() external view returns (contract SplitterImpl)
```

#### Returns

| Name | Type                  | Description |
| ---- | --------------------- | ----------- |
| \_0  | contract SplitterImpl | undefined   |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external pure returns (bool)
```

#### Parameters

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| interfaceId | bytes4 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### uri

```solidity
function uri(uint256 id) external view returns (string)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| id   | uint256 | undefined   |

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### usedVouchers

```solidity
function usedVouchers(bytes32) external view returns (bool)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### withdraw

```solidity
function withdraw() external nonpayable
```

### withdrawERC20

```solidity
function withdrawERC20(contract ERC20 _token) external nonpayable
```

#### Parameters

| Name    | Type           | Description |
| ------- | -------------- | ----------- |
| \_token | contract ERC20 | undefined   |

## Events

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| owner `indexed`    | address | undefined   |
| operator `indexed` | address | undefined   |
| approved           | bool    | undefined   |

### BaseURISet

```solidity
event BaseURISet(string indexed newBaseURI)
```

#### Parameters

| Name                 | Type   | Description |
| -------------------- | ------ | ----------- |
| newBaseURI `indexed` | string | undefined   |

### OwnerUpdated

```solidity
event OwnerUpdated(address indexed user, address indexed newOwner)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| user `indexed`     | address | undefined   |
| newOwner `indexed` | address | undefined   |

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

### SignerUpdated

```solidity
event SignerUpdated(address indexed newSigner)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| newSigner `indexed` | address | undefined   |

### TransferBatch

```solidity
event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] amounts)
```

#### Parameters

| Name               | Type      | Description |
| ------------------ | --------- | ----------- |
| operator `indexed` | address   | undefined   |
| from `indexed`     | address   | undefined   |
| to `indexed`       | address   | undefined   |
| ids                | uint256[] | undefined   |
| amounts            | uint256[] | undefined   |

### TransferSingle

```solidity
event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 amount)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| operator `indexed` | address | undefined   |
| from `indexed`     | address | undefined   |
| to `indexed`       | address | undefined   |
| id                 | uint256 | undefined   |
| amount             | uint256 | undefined   |

### URI

```solidity
event URI(string value, uint256 indexed id)
```

#### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| value        | string  | undefined   |
| id `indexed` | uint256 | undefined   |

## Errors

### InvalidSigner

```solidity
error InvalidSigner()
```

_0x815e1d64_

### NotMintedYet

```solidity
error NotMintedYet()
```

_0xbad086ea_

### UsedVoucher

```solidity
error UsedVoucher()
```

_0xe647f413_

### WrongPrice

```solidity
error WrongPrice()
```

_0xf7760f25_
