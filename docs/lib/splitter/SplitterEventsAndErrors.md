# SplitterEventsAndErrors

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
