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

### Pre Requisites

Before installing, create a `.env` file and set criteria as in `.env.example`.

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

#### **_NOTE:_** See coverage output in [coverage](./coverage/).

### Clean

Delete the smart contract artifacts and cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to the desired network:

```
yarn deploy:network
```

#### **_NOTE:_** Supported networks; Harmony Mainet, Skale Calypso, Skale Stage v3, Goerli

## Contracts Dependency Tree

#### **_NOTE:_** See smart contracts natspec docs in [documentation](./docs/).

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
