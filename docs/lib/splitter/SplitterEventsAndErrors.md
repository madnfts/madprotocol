# SplitterEventsAndErrors










## Events

### ERC20PaymentReleased

```solidity
event ERC20PaymentReleased(address indexed token, address to, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| to  | address | undefined |
| amount  | uint256 | undefined |

### PayeeAdded

```solidity
event PayeeAdded(address account, uint256 shares)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |
| shares  | uint256 | undefined |

### PaymentReceived

```solidity
event PaymentReceived(address from, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from  | address | undefined |
| amount  | uint256 | undefined |

### PaymentReleased

```solidity
event PaymentReleased(address to, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to  | address | undefined |
| amount  | uint256 | undefined |



## Errors

### AlreadyPayee

```solidity
error AlreadyPayee()
```



*0x42b50ca2*


### DeadAddress

```solidity
error DeadAddress()
```



*0x84ff3e1b*


### DeniedAccount

```solidity
error DeniedAccount()
```



*0xb8e10e7e*


### InvalidShare

```solidity
error InvalidShare()
```



*0x100d5f74*


### LengthMismatch

```solidity
error LengthMismatch()
```



*0xff633a38*


### NoPayees

```solidity
error NoPayees()
```



*0x7b21919d*


### NoShares

```solidity
error NoShares()
```



*0xb317087b*



