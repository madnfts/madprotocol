# MAD Smart Contracts v1.0

```ts
///     ...     ..      ..                    ..
///   x*8888x.:*8888: -"888:                dF
///  X   48888X `8888H  8888               '88bu.
/// X8x.  8888X  8888X  !888>        u     '*88888bu
/// X8888 X8888  88888   "*8%-    us888u.    ^"*8888N
/// '*888!X8888> X8888  xH8>   .@88 "8888"  beWE "888L
///   `?8 `8888  X888X X888>   9888  9888   888E  888E
///   -^  '888"  X888  8888>   9888  9888   888E  888E
///    dx '88~x. !88~  8888>   9888  9888   888E  888F
///  .8888Xf.888x:!    X888X.: 9888  9888  .888N..888
/// :""888":~"888"     `888*"  "888*""888"  `"888*""
///     "~'    "~        ""     ^Y"   ^Y'      ""     MADNFTs © 2022.
```

## Usage

## Sepolia BASE
Deployed Factory Address: 0xC29A0F9792c41Bfb58324aDd19Ba305f64DBBC7D
Deployed Router Address: 0x56BBaD08B7a210FdDDCA267e97eD336453E9356C
Deployed ERC20 Address: 0x19E689e473EA387667149bb0C7c99c3E3201BE50

## Sepolia Ethereum

Deployed contracts with 0xe1fe7A4DBF33e6dA8c9e2628d102c67FB9E94549
Deployed Factory Address: 0x09c8Dc3c8D85f6d128F29A91BeE718D647B78bD4
Deployed Router Address: 0x830BDDd15D9CD076c520330c59e3805D3aE0BD94
Deployed ERC20 Address: 0x70D3Ee80802873D724E3a4F4cF44F99a15743d9c

## SERV TESTNET contracts
Deployed contracts with 0x263eCFccbA81214D625B5743aaF121A657847294
Deployed Factory Address: 0xC3963ACcD36Fc19b8b7bd4000E4439b993A5c0aB
Deployed Router Address: 0x73b880f9c93b98F33f78ED321FD1DEC89265978e
Deployed ERC20 Address: 0x7d29c9d21aE49d441E4a2F7Fb66D5445B1DCF6E7

ConduitController deployed to: 0x2f5b471293a4bDF7b56f7193b82a9f8029Dae33B
Seaport deployed to: 0x9913bCaF9B1Bd71a150D0F79c048Db8Fabe6928d

## Skale Chaos Contracts:

Deploying contracts with 0xe1fe7A4DBF33e6dA8c9e2628d102c67FB9E94549
MockERC20 address: 0x0038dD433c3D98D7d18E0345dF043c442D3b3D88
Factory address: 0x09c8Dc3c8D85f6d128F29A91BeE718D647B78bD4
Router address: 0xA90Ff82851ed5594DEfE3BF9b2F5142e60575987

Splitter: 0x42b27CAdf6CeAE4f8d0c06ee6b5Ff4A54d0Ad2DF
Collection 721: 0xF52593aCeF1d17D810Bfb5806D5A767887CbD097

## Goerli Contracts:

Deployed contracts with 0xe1fe7A4DBF33e6dA8c9e2628d102c67FB9E94549
Deployed Factory Address: 0x4b6D7Ad325247618E413690e94094d43d03c9faf
Deployed Router Address: 0x45df25Dc886e8fd7D4284e036651AeE49aa927fD
Deployed ERC20 Address: 0xd7c8Ec52eF844A40344684691eE181000F2Ce73C


### Pre Requisites

Before installing, create a `.env` file and set criteria as in `.env.exar mple`.

### Install

```
yarn install
```

### Compile

```
yarn compile
```

**_NOTE:_** TypeChain artifacts generated at compile time.

### Tests

```
yarn test
```

### Report Gas

```
REPORT_GAS=true yarn test
```

**_NOTE_:** Gas usage per unit test and average gas per method call.

### Test coverage

```
yarn coverage
```

**_NOTE:_** Coverage results output to ./coverage.

### Clean

Delete the smart contract artifacts and cache:

```
yarn clean
```

### Deploy

Deploy the contracts to the desired network:

```
yarn deploy:network
```

**_NOTE:_** Supported networks; Harmony Mainet, Skale Calypso, Skale Stage v3, Goerli

## Contracts Dependency Tree

**_NOTE:_** See smart contracts natspec docs in [documentation](./docs/).

```rs
./contracts/
├── EventsAndErrors.sol
├── lib
│   ├── auth
│   │   ├── FactoryVerifier.sol
│   │   └── Owned.sol
│   ├── deployers
│   │   ├── ERC1155Deployer.sol
│   │   ├── ERC721Deployer.sol
│   │   └── SplitterDeployer.sol
│   ├── security
│   │   ├── DCPrevent.sol
│   │   ├── Pausable.sol
│   │   └── ReentrancyGuard.sol
│   ├── splitter
│   │   └── SplitterImpl.sol
│   ├── test
│   │   ├── erc1155-mock.sol
│   │   ├── erc20-mock.sol
│   │   ├── erc2981-mock.sol
│   │   ├── erc721-mock.sol
│   │   └── test-interfaces.sol
│   ├── tokens
│   │   ├── common
│   │   │   └── ERC2981.sol
│   │   ├── ERC1155
│   │   │   ├── Base
│   │   │   │   ├── ERC1155B.sol
│   │   │   │   ├── interfaces
│   │   │   │   │   ├── ERC1155EventAndErrors.sol
│   │   │   │   │   └── IERC1155.sol
│   │   │   │   └── utils
│   │   │   │       └── ERC1155Holder.sol
│   │   │   └── Impl
│   │   │       ├── ERC1155Basic.sol
│   │   │       ├── ERC1155Lazy.sol
│   │   │       ├── ERC1155Minimal.sol
│   │   │       └── ERC1155Whitelist.sol
│   │   ├── ERC20.sol
│   │   └── ERC721
│   │       ├── Base
│   │       │   ├── ERC721.sol
│   │       │   ├── interfaces
│   │       │   │   ├── ERC721EventAndErrors.sol
│   │       │   │   └── IERC721.sol
│   │       │   └── utils
│   │       │       └── ERC721Holder.sol
│   │       └── Impl
│   │           ├── ERC721Basic.sol
│   │           ├── ERC721Lazy.sol
│   │           ├── ERC721Minimal.sol
│   │           └── ERC721Whitelist.sol
│   └── utils
│       ├── Counters.sol
│       ├── CREATE3.sol
│       ├── MerkleProof.sol
│       ├── SafeTransferLib.sol
│       └── Strings.sol
├── MADFactory1155.sol
├── MADFactory721.sol
├── MADMarketplace1155.sol
├── MADMarketplace721.sol
├── MADRouter1155.sol
├── MADRouter721.sol
├── MAD.sol
└── Types.sol
```
