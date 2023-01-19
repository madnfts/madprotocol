# MADRouter1155









## Methods

### MADFactory1155

```solidity
function MADFactory1155() external view returns (contract FactoryVerifier)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract FactoryVerifier | undefined |

### basicMintBatchTo

```solidity
function basicMintBatchTo(address _token, address _to, uint256[] _ids, uint256[] _balances) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _to | address | undefined |
| _ids | uint256[] | undefined |
| _balances | uint256[] | undefined |

### basicMintTo

```solidity
function basicMintTo(address _token, address _to, uint256 _amount, uint256[] _balances) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _to | address | undefined |
| _amount | uint256 | undefined |
| _balances | uint256[] | undefined |

### batchBurn

```solidity
function batchBurn(address _token, address _from, uint256[] _ids, uint256[] _balances) external payable
```

Global token batch burn controller/single pusher for all token types.

*Function Sighash := 0xba36b92dTransfer events emitted by nft implementation contracts.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _from | address | undefined |
| _ids | uint256[] | The token IDs of each token to be burnt; should be left empty for the `ERC1155Minimal` type. |
| _balances | uint256[] | undefined |

### burn

```solidity
function burn(address _token, uint256[] _ids, address[] to, uint256[] _amount) external payable
```

Global token burn controller/single pusher for all token types.

*Function Sighash := 0xba36b92dTransfer events emitted by nft implementation contracts.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _ids | uint256[] | The token IDs of each token to be burnt; should be left empty for the `ERC1155Minimal` type. |
| to | address[] | undefined |
| _amount | uint256[] | undefined |

### creatorBatchMint

```solidity
function creatorBatchMint(address _token, uint256[] _ids, uint256[] _balances, uint256 totalBalance) external payable
```

`ERC1155Whitelist` batch mint to creator function handler.

*Function Sighash := 0x182ee485*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _ids | uint256[] | undefined |
| _balances | uint256[] | undefined |
| totalBalance | uint256 | undefined |

### creatorMint

```solidity
function creatorMint(address _token, uint256 _amount, uint256[] _balances, uint256 totalBalance) external payable
```

`ERC1155Whitelist` mint to creator function handler.

*Function Sighash := 0x182ee485*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _amount | uint256 | undefined |
| _balances | uint256[] | undefined |
| totalBalance | uint256 | undefined |

### erc20

```solidity
function erc20() external view returns (contract ERC20)
```



*ERC20 payment token address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ERC20 | undefined |

### feeBurn

```solidity
function feeBurn() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### feeLookup

```solidity
function feeLookup(bytes4 sigHash) external view returns (uint256 fee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sigHash | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| fee | uint256 | undefined |

### feeMint

```solidity
function feeMint() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### freeSettings

```solidity
function freeSettings(address _token, uint256 _freeAmount, uint256 _maxFree, bytes32 _claimRoot) external nonpayable
```

`ERC1155Whitelist` free claim config setter.

*Function Sighash := 0xcab2e41fEvent emitted by `ERC1155Whitelist` token implementation contracts.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _freeAmount | uint256 | undefined |
| _maxFree | uint256 | undefined |
| _claimRoot | bytes32 | undefined |

### gift

```solidity
function gift(address _token, address[] _addresses, uint256[] _balances, uint256 totalBalance) external payable
```

`ERC1155Whitelist` gift tokens function handler.

*Function Sighash := 0x67b5a642*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _addresses | address[] | undefined |
| _balances | uint256[] | undefined |
| totalBalance | uint256 | undefined |

### minimalSafeMint

```solidity
function minimalSafeMint(address _token, address _to, uint256 balance) external payable
```

`ERC1155Minimal` creator mint function handler.

*Function Sighash := 0x42a42752*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _to | address | undefined |
| balance | uint256 | undefined |

### name

```solidity
function name() external pure returns (string)
```



*Function Sighash := 0x06fdde03*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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

*Function Sighash := 0x8456cb59*


### paused

```solidity
function paused() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### setFees

```solidity
function setFees(uint256 _feeMint, uint256 _feeBurn) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeMint | uint256 | undefined |
| _feeBurn | uint256 | undefined |

### setMintState

```solidity
function setMintState(address _token, bool _state, uint8 _stateType) external nonpayable
```

Global MintState setter/controller with switch cases/control flow handling conditioned by both `_stateType` and `_tokenType`.

*Function Sighash := 0xab9acd57Events logged by each tokens&#39; `setState` functions.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _state | bool | undefined |
| _stateType | uint8 | Values legend: 0 := PublicMintState (minimal, basic, whitelist); 1 := WhitelistMintState (whitelist); 2 := FreeClaimState (whitelist). |

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

### setSigner

```solidity
function setSigner(address _token, address _signer) external nonpayable
```

Change the address used for lazy minting voucher validation.

*Function Sighash := 0x17f9fad1Event emitted by token contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _signer | address | undefined |

### setURI

```solidity
function setURI(address _token, string _uri) external nonpayable
```

Collection `_uri` setter.

*Only available for Basic, Whitelist and Lazy token types.Function Sighash := 0x4328bd00Events logged by each tokens&#39; functions.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _uri | string | undefined |

### unpause

```solidity
function unpause() external nonpayable
```

Unpaused state initializer for security risk mitigation pratice.

*Function Sighash := 0x3f4ba83a*


### whitelistSettings

```solidity
function whitelistSettings(address _token, uint256 _price, uint256 _supply, bytes32 _root) external nonpayable
```

`ERC1155Whitelist` whitelist config setter.

*Function Sighash := 0xa123c38dEvent emitted by `ERC1155Whitelist` token implementation contracts.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _price | uint256 | undefined |
| _supply | uint256 | undefined |
| _root | bytes32 | undefined |

### withdraw

```solidity
function withdraw(address _token, contract ERC20 _erc20) external nonpayable
```

Withdraw both ERC20 and ONE from ERC1155 contract&#39;s balance.

*Function Sighash := 0x9547ed5dLeave `_token` param empty for withdrawing eth only.No withdraw min needs to be passed as params, since all balance from the token&#39;s contract is emptied.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _erc20 | contract ERC20 | undefined |



## Events

### BaseURI

```solidity
event BaseURI(bytes32 indexed _id, string indexed _baseURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _id `indexed` | bytes32 | undefined |
| _baseURI `indexed` | string | undefined |

### FeesUpdated

```solidity
event FeesUpdated(uint256 burnFees, uint256 mintFees)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| burnFees  | uint256 | undefined |
| mintFees  | uint256 | undefined |

### FreeClaimState

```solidity
event FreeClaimState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _id `indexed` | bytes32 | undefined |
| _type `indexed` | uint8 | undefined |
| _state `indexed` | bool | undefined |

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

### PublicMintState

```solidity
event PublicMintState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _id `indexed` | bytes32 | undefined |
| _type `indexed` | uint8 | undefined |
| _state `indexed` | bool | undefined |

### TokenFundsWithdrawn

```solidity
event TokenFundsWithdrawn(bytes32 indexed _id, uint8 indexed _type, address indexed _payee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _id `indexed` | bytes32 | undefined |
| _type `indexed` | uint8 | undefined |
| _payee `indexed` | address | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### WhitelistMintState

```solidity
event WhitelistMintState(bytes32 indexed _id, uint8 indexed _type, bool indexed _state)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _id `indexed` | bytes32 | undefined |
| _type `indexed` | uint8 | undefined |
| _state `indexed` | bool | undefined |



## Errors

### WrongPrice

```solidity
error WrongPrice()
```



*0xf7760f25*



