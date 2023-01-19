# MADRouter721









## Methods

### MADFactory721

```solidity
function MADFactory721() external view returns (contract FactoryVerifier)
```

FactoryVerifier connecting the router to MADFactory721.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract FactoryVerifier | undefined |

### basicMintTo

```solidity
function basicMintTo(address _token, address _to, uint256 _amount) external payable
```

ERC721Basic creator mint function handler.

*Function Sighash := ?*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _to | address | Receiver token address. |
| _amount | uint256 | Num tokens to mint and send. |

### burn

```solidity
function burn(address _token, uint256[] _ids) external payable
```

Global token burn controller/single pusher for all token types.

*Function Sighash := 0xba36b92d*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _ids | uint256[] | The token IDs of each token to be burnt;        should be left empty for the `ERC721Minimal` type. |

### creatorMint

```solidity
function creatorMint(address _token, uint256 _amount) external payable
```

ERC721Whitelist mint to creator function handler.

*Function Sighash := 0x182ee485*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _amount | uint256 | Num tokens to mint and send. |

### erc20

```solidity
function erc20() external view returns (contract ERC20)
```

ERC20 payment token address.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ERC20 | undefined |

### feeBurn

```solidity
function feeBurn() external view returns (uint256)
```

Burn fee store.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### feeLookup

```solidity
function feeLookup(bytes4 sigHash) external view returns (uint256 fee)
```

Mint and burn fee lookup.

*Function Sighash := ?*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sigHash | bytes4 | MINSAFEMINT | MINBURN |

#### Returns

| Name | Type | Description |
|---|---|---|
| fee | uint256 | undefined |

### feeMint

```solidity
function feeMint() external view returns (uint256)
```

Mint fee store.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### freeSettings

```solidity
function freeSettings(address _token, uint256 _freeAmount, uint256 _maxFree, bytes32 _claimRoot) external nonpayable
```

`ERC721Whitelist` free claim config setter.

*Event emitted by `ERC721Whitelist` token implementation contracts.      Function Sighash := 0xcab2e41f*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _freeAmount | uint256 | Num tokens per address. |
| _maxFree | uint256 | Max free tokens available. |
| _claimRoot | bytes32 | Merkel root. |

### gift

```solidity
function gift(address _token, address[] _addresses) external payable
```

ERC721Whitelist gift tokens function handler.

*Function Sighash := 0x67b5a642*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _addresses | address[] | Array of addresses to gift too. |

### minimalSafeMint

```solidity
function minimalSafeMint(address _token, address _to) external payable
```

ERC721Minimal creator mint function handler.

*Function Sighash := 0x42a42752*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _to | address | Receiver token address. |

### name

```solidity
function name() external pure returns (string)
```

Contract name.

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

### setBase

```solidity
function setBase(address _token, string _baseURI) external nonpayable
```

Collection baseURI setter.

*Only available for Basic, Whitelist and Lazy token types. Events logged       by each tokens&#39; BaseURISet functions.      Function Sighash := 0x4328bd00*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _baseURI | string | New base URI string. |

### setFees

```solidity
function setFees(uint256 _feeMint, uint256 _feeBurn) external nonpayable
```

Change the Routers mint and burn fees.

*Event emitted by token contract.      Function Sighash := ?*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeMint | uint256 | New mint fee. |
| _feeBurn | uint256 | New burn fee. |

### setMintState

```solidity
function setMintState(address _token, bool _state, uint8 _stateType) external nonpayable
```

Global MintState setter/controller  

*Switch cases/control flow handling conditioned by both `_stateType` and `_tokenType`.       Events logged by each tokens&#39; `setState` functions.      Function Sighash := 0xab9acd57*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _state | bool | Set state to true or false. |
| _stateType | uint8 | Values:      0 := PublicMintState (minimal, basic, whitelist);      1 := WhitelistMintState (whitelist);      2 := FreeClaimState (whitelist). |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```

Set the Routers owner address.

*Function Signature := 0x13af4035*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | New owners address. |

### setPaymentToken

```solidity
function setPaymentToken(address _paymentTokenAddress) external nonpayable
```

Enables the contract&#39;s owner to change payment token address.

*Function Signature := ?*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _paymentTokenAddress | address | erc20 token address | address(0). |

### setSigner

```solidity
function setSigner(address _token, address _signer) external nonpayable
```

Change the address used for lazy minting voucher validation.

*Event emitted by token contract.      Function Sighash := 0x17f9fad1*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _signer | address | New signers address. |

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

`ERC721Whitelist` whitelist config setter.

*Events event emitted by `ERC721Whitelist` token implementation contracts.      Function Sighash := 0xa123c38d*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _price | uint256 | Whitelist price per token. |
| _supply | uint256 | Num tokens per address. |
| _root | bytes32 | Merkel root. |

### withdraw

```solidity
function withdraw(address _token, contract ERC20 _erc20) external nonpayable
```

Withdraw both ERC20 and ONE from ERC721 contract&#39;s balance.

*Leave `_token` param empty for withdrawing eth only. No withdraw min needs to be passed as params, since      all balance from the token&#39;s contract is emptied.      Function Sighash := 0x9547ed5d*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | 721 token address. |
| _erc20 | contract ERC20 | ERC20 token address. |



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



