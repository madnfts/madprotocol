# FactoryVerifier



> Factory Verifier

Core contract binding interface that connect both `MADMarketplace` and `MADRouter` storage verifications made to `MADFactory`.



## Methods

### creatorAuth

```solidity
function creatorAuth(address _token, address _user) external view returns (bool stdout)
```

Authority validator for no-fee marketplace listing.

*Function Sighash := 0x76de0f3dBinds Marketplace&#39;s pull payment methods to Factory storage.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | Address of the traded token. |
| _user | address | Token Seller that must match collection creator for no-fee listing. |

#### Returns

| Name | Type | Description |
|---|---|---|
| stdout | bool | := 1 as boolean standard output. |

### creatorCheck

```solidity
function creatorCheck(bytes32 _colID) external view returns (address creator, bool check)
```

Authority validator for `MADRouter` creator settings and withdraw functions.

*Function Sighash := 0xb64bd5eb*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _colID | bytes32 | 32 bytes collection ID value. |

#### Returns

| Name | Type | Description |
|---|---|---|
| creator | address | bb |
| check | bool | Boolean output to either approve or reject call&#39;s `tx.origin` function access. |

### getColID

```solidity
function getColID(address _colAddress) external pure returns (bytes32 colID)
```



*Convert address to `colID` (20bytes =&gt; 32bytes).Function Sighash := 0x617d1d3b*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _colAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| colID | bytes32 | undefined |

### typeChecker

```solidity
function typeChecker(bytes32 _colID) external view returns (uint8 pointer)
```



*Returns the collection type uint8 value in case token and user are authorized.Function Sighash := 0xd93cb8fd*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _colID | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| pointer | uint8 | undefined |




## Errors

### AccessDenied

```solidity
error AccessDenied()
```



*0x4ca88867*



