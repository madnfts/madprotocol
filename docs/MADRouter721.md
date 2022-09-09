# MADRouter721

## Methods

### MADFactory721

```solidity
function MADFactory721() external view returns (contract FactoryVerifier)
```

#### Returns

| Name | Type                     | Description |
| ---- | ------------------------ | ----------- |
| \_0  | contract FactoryVerifier | undefined   |

### basicMintTo

```solidity
function basicMintTo(address _token, address _to, uint256 _amount) external nonpayable
```

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_token  | address | undefined   |
| \_to     | address | undefined   |
| \_amount | uint256 | undefined   |

### burn

```solidity
function burn(address _token, uint256[] _ids) external nonpayable
```

Global token burn controller/single pusher for all token types.

_Function Sighash := 0xba36b92dTransfer events emitted by nft implementation contracts._

#### Parameters

| Name    | Type      | Description                                                                                 |
| ------- | --------- | ------------------------------------------------------------------------------------------- |
| \_token | address   | undefined                                                                                   |
| \_ids   | uint256[] | The token IDs of each token to be burnt; should be left empty for the `ERC721Minimal` type. |

### creatorMint

```solidity
function creatorMint(address _token, uint256 _amount) external nonpayable
```

`ERC721Whitelist` mint to creator function handler.

_Function Sighash := 0x182ee485_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_token  | address | undefined   |
| \_amount | uint256 | undefined   |

### freeSettings

```solidity
function freeSettings(address _token, uint256 _freeAmount, uint256 _maxFree, bytes32 _claimRoot) external nonpayable
```

`ERC721Whitelist` free claim config setter.

_Function Sighash := 0xcab2e41fEvent emitted by `ERC721Whitelist` token implementation contracts._

#### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| \_token      | address | undefined   |
| \_freeAmount | uint256 | undefined   |
| \_maxFree    | uint256 | undefined   |
| \_claimRoot  | bytes32 | undefined   |

### gift

```solidity
function gift(address _token, address[] _addresses) external nonpayable
```

`ERC721Whitelist` gift tokens function handler.

_Function Sighash := 0x67b5a642_

#### Parameters

| Name        | Type      | Description |
| ----------- | --------- | ----------- |
| \_token     | address   | undefined   |
| \_addresses | address[] | undefined   |

### minimalSafeMint

```solidity
function minimalSafeMint(address _token, address _to) external nonpayable
```

`ERC721Minimal` creator mint function handler.

_Function Sighash := 0x42a42752_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_token | address | undefined   |
| \_to    | address | undefined   |

### name

```solidity
function name() external pure returns (string)
```

_Function Sighash := 0x06fdde03_

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

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

_Function Sighash := 0x8456cb59_

### paused

```solidity
function paused() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### setBase

```solidity
function setBase(address _token, string _baseURI) external nonpayable
```

Collection `baseURI` setter.

_Only available for Basic, Whitelist and Lazy token types.Function Sighash := 0x4328bd00Events logged by each tokens&#39; `BaseURISet` functions._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| \_token   | address | undefined   |
| \_baseURI | string  | undefined   |

### setMintState

```solidity
function setMintState(address _token, bool _state, uint8 _stateType) external nonpayable
```

Global MintState setter/controller with switch cases/control flow handling conditioned by both `_stateType` and `_tokenType`.

_Function Sighash := 0xab9acd57Events logged by each tokens&#39; `setState` functions._

#### Parameters

| Name        | Type    | Description                                                                                                                            |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| \_token     | address | undefined                                                                                                                              |
| \_state     | bool    | undefined                                                                                                                              |
| \_stateType | uint8   | Values legend: 0 := PublicMintState (minimal, basic, whitelist); 1 := WhitelistMintState (whitelist); 2 := FreeClaimState (whitelist). |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```

_Function Signature := 0x13af4035_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### setSigner

```solidity
function setSigner(address _token, address _signer) external nonpayable
```

Change the address used for lazy minting voucher validation.

_Function Sighash := 0x17f9fad1Event emitted by token contract._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_token  | address | undefined   |
| \_signer | address | undefined   |

### unpause

```solidity
function unpause() external nonpayable
```

Unpaused state initializer for security risk mitigation pratice.

_Function Sighash := 0x3f4ba83a_

### whitelistSettings

```solidity
function whitelistSettings(address _token, uint256 _price, uint256 _supply, bytes32 _root) external nonpayable
```

`ERC721Whitelist` whitelist config setter.

_Function Sighash := 0xa123c38dEvent emitted by `ERC721Whitelist` token implementation contracts._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_token  | address | undefined   |
| \_price  | uint256 | undefined   |
| \_supply | uint256 | undefined   |
| \_root   | bytes32 | undefined   |

### withdraw

```solidity
function withdraw(address _token, contract ERC20 _erc20) external nonpayable
```

Withdraw both ERC20 and ONE from ERC721 contract&#39;s balance.

_Function Sighash := 0x9547ed5dLeave `_token` param empty for withdrawing eth only.No withdraw min needs to be passed as params, since all balance from the token&#39;s contract is emptied._

#### Parameters

| Name    | Type           | Description |
| ------- | -------------- | ----------- |
| \_token | address        | undefined   |
| \_erc20 | contract ERC20 | undefined   |

## Events

### BaseURI

```solidity
event BaseURI(bytes32 indexed _id, string indexed _baseURI)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| \_id `indexed`      | bytes32 | undefined   |
| \_baseURI `indexed` | string  | undefined   |

### FreeClaimState

```solidity
event FreeClaimState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_id `indexed`    | bytes32 | undefined   |
| \_type `indexed`  | uint8   | undefined   |
| \_state `indexed` | bool    | undefined   |

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

### PublicMintState

```solidity
event PublicMintState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_id `indexed`    | bytes32 | undefined   |
| \_type `indexed`  | uint8   | undefined   |
| \_state `indexed` | bool    | undefined   |

### TokenFundsWithdrawn

```solidity
event TokenFundsWithdrawn(bytes32 indexed _id, uint8 indexed _type, address indexed _payee)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_id `indexed`    | bytes32 | undefined   |
| \_type `indexed`  | uint8   | undefined   |
| \_payee `indexed` | address | undefined   |

### Unpaused

```solidity
event Unpaused(address account)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

### WhitelistMintState

```solidity
event WhitelistMintState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_id `indexed`    | bytes32 | undefined   |
| \_type `indexed`  | uint8   | undefined   |
| \_state `indexed` | bool    | undefined   |
