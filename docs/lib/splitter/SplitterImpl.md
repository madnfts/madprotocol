# SplitterImpl

_This contract assumes that ERC20 tokens will behave similarly to native tokens (Ether). Rebasing tokens, and tokens that apply fees during transfers, are likely to not be supported as expected. If in doubt, we encourage you to run tests before sending real value to this contract._

## Methods

### \_payees

```solidity
function _payees(uint256) external view returns (address)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### \_shares

```solidity
function _shares(address) external view returns (uint256)
```

_Native public getters provided._

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### payeesLength

```solidity
function payeesLength() external view returns (uint256)
```

_Getter for `_payees.length`._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### releasable

```solidity
function releasable(address account) external view returns (uint256)
```

_Getter for the amount of payee&#39;s releasable Ether._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### releasable

```solidity
function releasable(contract ERC20 token, address account) external view returns (uint256)
```

_Getter for the amount of payee&#39;s releasable `token` tokens.`token` should be the address of an ERC20 contract._

#### Parameters

| Name    | Type           | Description |
| ------- | -------------- | ----------- |
| token   | contract ERC20 | undefined   |
| account | address        | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### release

```solidity
function release(address payable account) external nonpayable
```

_Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the total shares and their previous withdrawals._

#### Parameters

| Name    | Type            | Description |
| ------- | --------------- | ----------- |
| account | address payable | undefined   |

### release

```solidity
function release(contract ERC20 token, address account) external nonpayable
```

_Triggers a transfer to `account` of the amount of `token` tokens they are owed, according to their percentage of the total shares and their previous withdrawals. `token` must be the address of an ERC20 contract._

#### Parameters

| Name    | Type           | Description |
| ------- | -------------- | ----------- |
| token   | contract ERC20 | undefined   |
| account | address        | undefined   |

### releaseAll

```solidity
function releaseAll() external nonpayable
```

_Release all pending withdrawals._

### released

```solidity
function released(contract ERC20 token, address account) external view returns (uint256)
```

_Getter for the amount of `token` tokens already released to a payee. `token` should be the address of an ERC20 contract._

#### Parameters

| Name    | Type           | Description |
| ------- | -------------- | ----------- |
| token   | contract ERC20 | undefined   |
| account | address        | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### released

```solidity
function released(address account) external view returns (uint256)
```

_Getter for the amount of Ether already released to a payee._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### totalReleased

```solidity
function totalReleased(contract ERC20 token) external view returns (uint256)
```

_Getter for the total amount of `token` already released.`token` should be the address of an ERC20 contract._

#### Parameters

| Name  | Type           | Description |
| ----- | -------------- | ----------- |
| token | contract ERC20 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### totalReleased

```solidity
function totalReleased() external view returns (uint256)
```

_Getter for the total amount of Ether already released._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### totalShares

```solidity
function totalShares() external view returns (uint256)
```

_Getter for the total shares held by payees._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

## Events

### ERC20PaymentReleased

```solidity
event ERC20PaymentReleased(address indexed token, address to, uint256 amount)
```

#### Parameters

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| token `indexed` | address | undefined   |
| to              | address | undefined   |
| amount          | uint256 | undefined   |

### PayeeAdded

```solidity
event PayeeAdded(address account, uint256 shares)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |
| shares  | uint256 | undefined   |

### PaymentReceived

```solidity
event PaymentReceived(address from, uint256 amount)
```

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| from   | address | undefined   |
| amount | uint256 | undefined   |

### PaymentReleased

```solidity
event PaymentReleased(address to, uint256 amount)
```

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| to     | address | undefined   |
| amount | uint256 | undefined   |

## Errors

### AlreadyPayee

```solidity
error AlreadyPayee()
```

_0x42b50ca2_

### DeadAddress

```solidity
error DeadAddress()
```

_0x84ff3e1b_

### DeniedAccount

```solidity
error DeniedAccount()
```

_0xb8e10e7e_

### InvalidShare

```solidity
error InvalidShare()
```

_0x100d5f74_

### LengthMismatch

```solidity
error LengthMismatch()
```

_0xff633a38_

### NoPayees

```solidity
error NoPayees()
```

_0x7b21919d_

### NoShares

```solidity
error NoShares()
```

_0xb317087b_
