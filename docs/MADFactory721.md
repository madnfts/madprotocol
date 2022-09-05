# MADFactory721

## Methods

### colInfo

```solidity
function colInfo(bytes32) external view returns (address creator, enum Types.ERC721Type colType, bytes32 colSalt, uint256 blocknumber, address splitter)
```

_`colIDs` are derived from adding 12 bytes of zeros to an collection&#39;s address.colID =&gt; colInfo(salt/type/addr/time/splitter)_

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

#### Returns

| Name        | Type                  | Description |
| ----------- | --------------------- | ----------- |
| creator     | address               | undefined   |
| colType     | enum Types.ERC721Type | undefined   |
| colSalt     | bytes32               | undefined   |
| blocknumber | uint256               | undefined   |
| splitter    | address               | undefined   |

### createCollection

```solidity
function createCollection(uint8 _tokenType, string _tokenSalt, string _name, string _symbol, uint256 _price, uint256 _maxSupply, string _baseURI, address _splitter, uint256 _royalty) external nonpayable
```

Core public ERC721 token types deployment pusher.

_Function Sighash := 0x73fd6808Args passed as params in this function serve as common denominator for all token types.Extra config options must be set directly by through token type specific functions in `MADRouter` contract.Frontend must attent that salt values must have common pattern so to not replicate same output._

#### Parameters

| Name        | Type    | Description                                                                                                                                                                            |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_tokenType | uint8   | Values legend: 0=Minimal; 1=Basic; 2=Whitelist; 3=Lazy.                                                                                                                                |
| \_tokenSalt | string  | Nonce/Entropy factor used by CREATE3 method to generate collection deployment address. Must be always different to avoid address collision.                                            |
| \_name      | string  | Name of the collection to be deployed.                                                                                                                                                 |
| \_symbol    | string  | Symbol of the collection to be deployed.                                                                                                                                               |
| \_price     | uint256 | Public mint price of the collection to be deployed.                                                                                                                                    |
| \_maxSupply | uint256 | Maximum supply of tokens to be minted of the collection to be deployed (Not used for ERC721Minimal token type, since it always equals to one).                                         |
| \_baseURI   | string  | The URL + CID to be added the tokenID and suffix (.json) by the tokenURI function in the collection to be deployed (baseURI used as tokenURI itself for the ERC721Minimal token type). |
| \_splitter  | address | Previously deployed Splitter implementation so to validate and attach to collection.                                                                                                   |
| \_royalty   | uint256 | Ranges in between 0%-10%, in percentage basis points, accepted (Min tick := 25).                                                                                                       |

### creatorAuth

```solidity
function creatorAuth(address _token, address _user) external view returns (bool stdout)
```

Authority validator for no-fee marketplace listing.

_Function Sighash := 0x76de0f3dBinds Marketplace&#39;s pull payment methods to Factory storage._

#### Parameters

| Name    | Type    | Description                                                         |
| ------- | ------- | ------------------------------------------------------------------- |
| \_token | address | Address of the traded token.                                        |
| \_user  | address | Token Seller that must match collection creator for no-fee listing. |

#### Returns

| Name   | Type | Description                      |
| ------ | ---- | -------------------------------- |
| stdout | bool | := 1 as boolean standard output. |

### creatorCheck

```solidity
function creatorCheck(bytes32 _colID) external view returns (address creator, bool check)
```

Authority validator for `MADRouter` creator settings and withdraw functions.

_Function Sighash := 0xb64bd5eb_

#### Parameters

| Name    | Type    | Description                   |
| ------- | ------- | ----------------------------- |
| \_colID | bytes32 | 32 bytes collection ID value. |

#### Returns

| Name    | Type    | Description                                                                        |
| ------- | ------- | ---------------------------------------------------------------------------------- |
| creator | address | bb                                                                                 |
| check   | bool    | Boolean output to either approve or reject call&#39;s `tx.origin` function access. |

### getColID

```solidity
function getColID(address _colAddress) external pure returns (bytes32 colID)
```

_Convert address to `colID` (20bytes =&gt; 32bytes).Function Sighash := 0x617d1d3b_

#### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| \_colAddress | address | undefined   |

#### Returns

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| colID | bytes32 | undefined   |

### getDeployedAddr

```solidity
function getDeployedAddr(string _salt) external view returns (address)
```

#### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| \_salt | string | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### getIDsLength

```solidity
function getIDsLength(address _user) external view returns (uint256)
```

Everything in storage can be fetch through the getters natively provided by all public mappings.

_This public getter serve as a hook to ease frontend fetching whilst estimating user&#39;s colID indexes.Function Sighash := 0x8691fe46_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| \_user | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### market

```solidity
function market() external view returns (address)
```

_Instance of `MADMarketplace` being passed as parameter of `creatorAuth`._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### name

```solidity
function name() external pure returns (string)
```

_Function SigHash: 0x06fdde03_

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

### router

```solidity
function router() external view returns (address)
```

_Instance of `MADRouter` being passed as parameter of collection&#39;s constructor._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### setMarket

```solidity
function setMarket(address _market) external nonpayable
```

_`MADMarketplace` instance setter.Function Sighash := _

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_market | address | undefined   |

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```

_Function Signature := 0x13af4035_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### setRouter

```solidity
function setRouter(address _router) external nonpayable
```

_`MADRouter` instance setter.Function Sighash := 0xc0d78655_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_router | address | undefined   |

### setSigner

```solidity
function setSigner(address _signer) external nonpayable
```

_Setter for EIP712 signer/validator instance.Function Sighash := 0x6c19e783_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_signer | address | undefined   |

### splitterCheck

```solidity
function splitterCheck(string _splitterSalt, address _ambassador, uint256 _ambShare) external nonpayable
```

Splitter deployment pusher.

_Function Sighash := 0x9e5c4b70_

#### Parameters

| Name           | Type    | Description                                                                                                                                                            |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_splitterSalt | string  | Nonce/Entropy factor used by CREATE3 method. Must be always different to avoid address collision. to generate payment splitter deployment address.                     |
| \_ambassador   | address | User may choose from one of the whitelisted addresses to donate 1%-20% of secondary sales royalties (optional, will be disregarded if left empty(value == address(0)). |
| \_ambShare     | uint256 | Percentage (1%-20%) of secondary sales royalties to be donated to an ambassador (optional, will be disregarded if left empty(value == 0)).                             |

### splitterInfo

```solidity
function splitterInfo(address, address) external view returns (address splitter, bytes32 splitterSalt, address ambassador, uint256 ambShare, bool valid)
```

_Nested mapping that takes an collection creator as key of an hashmap of splitter contracts to its respective deployment configs._

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | address | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| splitter     | address | undefined   |
| splitterSalt | bytes32 | undefined   |
| ambassador   | address | undefined   |
| ambShare     | uint256 | undefined   |
| valid        | bool    | undefined   |

### typeChecker

```solidity
function typeChecker(bytes32 _colID) external view returns (uint8 pointer)
```

_Returns the collection type uint8 value in case token and user are authorized.Function Sighash := 0xd93cb8fd_

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_colID | bytes32 | undefined   |

#### Returns

| Name    | Type  | Description |
| ------- | ----- | ----------- |
| pointer | uint8 | undefined   |

### unpause

```solidity
function unpause() external nonpayable
```

Unpaused state initializer for security risk mitigation pratice.

_Function Sighash := 0x3f4ba83a_

### userTokens

```solidity
function userTokens(address, uint256) external view returns (bytes32)
```

_Maps an collection creator, of type address, to an array of `colIDs`._

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

## Events

### ERC721BasicCreated

```solidity
event ERC721BasicCreated(address indexed newSplitter, address indexed newCollection, address indexed newCreator)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| newSplitter `indexed`   | address | undefined   |
| newCollection `indexed` | address | undefined   |
| newCreator `indexed`    | address | undefined   |

### ERC721LazyCreated

```solidity
event ERC721LazyCreated(address indexed newSplitter, address indexed newCollection, address indexed newCreator)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| newSplitter `indexed`   | address | undefined   |
| newCollection `indexed` | address | undefined   |
| newCreator `indexed`    | address | undefined   |

### ERC721MinimalCreated

```solidity
event ERC721MinimalCreated(address indexed newSplitter, address indexed newCollection, address indexed newCreator)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| newSplitter `indexed`   | address | undefined   |
| newCollection `indexed` | address | undefined   |
| newCreator `indexed`    | address | undefined   |

### ERC721WhitelistCreated

```solidity
event ERC721WhitelistCreated(address indexed newSplitter, address indexed newCollection, address indexed newCreator)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| newSplitter `indexed`   | address | undefined   |
| newCollection `indexed` | address | undefined   |
| newCreator `indexed`    | address | undefined   |

### MarketplaceUpdated

```solidity
event MarketplaceUpdated(address indexed newMarket)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| newMarket `indexed` | address | undefined   |

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

### RouterUpdated

```solidity
event RouterUpdated(address indexed newRouter)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| newRouter `indexed` | address | undefined   |

### SignerUpdated

```solidity
event SignerUpdated(address indexed newSigner)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| newSigner `indexed` | address | undefined   |

### SplitterCreated

```solidity
event SplitterCreated(address indexed creator, uint256[] shares, address[] payees, address splitter)
```

#### Parameters

| Name              | Type      | Description |
| ----------------- | --------- | ----------- |
| creator `indexed` | address   | undefined   |
| shares            | uint256[] | undefined   |
| payees            | address[] | undefined   |
| splitter          | address   | undefined   |

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

### InvalidRoyalty

```solidity
error InvalidRoyalty()
```

_0xe0e54ced_

### SplitterFail

```solidity
error SplitterFail()
```

_0x00adecf0_
