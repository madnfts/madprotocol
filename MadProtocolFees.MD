# Factory

- Accept either Native (ETH) or ERC20 Tokens as Fee Payment
- Accept either Native (ETH) or ERC20 Tokens as `Price` for Public Minting

## Create Collection

`createCollection(params, [erc20Token])` will take in the following parameters:

``` javascript
CreateCollectionParams {
        address madFeeTokenAddress;  <-- Fee Payment - 0x0 address will resolve to Native (ETH)
        uint8 tokenType;
        bytes32 tokenSalt;
        string collectionName;
        string collectionSymbol;
        uint256 price;
        uint256 maxSupply;
        string uri;
        address splitter;
        uint96 royalty;
    }
```
### For Native(Eth) Fee Payment:

Ignore the `erc20Address` field and the public mint price of the collection will be in Native (ETH)


``` javascript
createCollection(
        CreateCollectionParams calldata params
    )
```

### For ERC20 Fee Payment:

Include the `erc20Address` field and the public mint price of the collection will be in the ERC20 Token

``` javascript
createCollection(
        CreateCollectionParams calldata params,
        address collectionToken  <-- ERC20 Token Address for public minting

    )

```

## Create Splitter

`createSplitter(params)` will take in the following parameters and create a splitter contract:

``` javascript
    CreateSplitterParams {
        bytes32 splitterSalt;
        address ambassador;
        address project;
        uint256 ambassadorShare;
        uint256 projectShare;
        address madFeeTokenAddress; <-- Fee Payment - 0x0 address will resolve to Native (ETH)
    }
```

## Native (ETH) Token Mapping Factory

Native (ETH) fees are called from the following functions.

``` javascript

    feeCreateCollection() external view returns (uint256);
    feeCreateSplitter() external view returns (uint256);
```

## Erc20 Token Mapping Factory

ERC20 fees are set in a struct.

``` javascript
    Fee {
            uint256 feeAmount;
            bool isValid;
        }
```

To check if an ERC20 token is valid, the following functions can be called:

```javascript
    feeCreateCollectionErc20(address token) external view returns (Fee);

    feeCreateSplitterErc20(address token) external view returns (Fee);
```
Each will return if the token is valid and the fee amount.

# Router

- Accept either Native (ETH) or ERC20 Tokens as Fee Payment
- Accept either Native (ETH) or ERC20 Tokens as `Price` for Public Minting

## MintTo

When an owner uses MAD to mint NFT's they will be charged a fee for each mint.

The fee can be paid in either Native (ETH) or ERC20 Tokens.

Using ETH we ignore the `erc20Address` field and the fee will be paid in Native (ETH).

``` javascript
    mintTo(
        address collection,
        address to,
        uint256 amount
    ) external payable;
```

Using ERC20 Tokens we include the `erc20Address` field and the fee will be paid in the ERC20 Token.

``` javascript
    mintTo(
        address collection,
        address to,
        uint256 amount,
        address erc20Address <-- ERC20 Token Address for fee payment
    ) external payable;
```

The same logic applies to `mint`, `burn` and batches of those

## Native (ETH) Token Mapping Router

Native (ETH) fees are called from the following functions.

``` javascript
    feeMint() external view returns (uint256);
    feeBurn() external view returns (uint256);
```

## Erc20 Token Mapping Router

ERC20 fees are set in a struct.

``` javascript
    Fee {
            uint256 feeAmount;
            bool isValid;
        }
```

To check if an ERC20 token is valid, the following functions can be called:

```javascript
    feeMintErc20(address token) external view returns (Fee);

    feeBurnErc20(address token) external view returns (Fee);
```

Each will return if the token is valid and the fee amount.
