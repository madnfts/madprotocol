/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { MADFactory721, MADFactory721Interface } from "../MADFactory721";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_marketplace",
        type: "address",
      },
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_signer",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRoyalty",
    type: "error",
  },
  {
    inputs: [],
    name: "SplitterFail",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSplitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newCollection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ERC721BasicCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSplitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newCollection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ERC721LazyCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSplitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newCollection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ERC721MinimalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSplitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newCollection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ERC721WhitelistCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newMarket",
        type: "address",
      },
    ],
    name: "MarketplaceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newRouter",
        type: "address",
      },
    ],
    name: "RouterUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSigner",
        type: "address",
      },
    ],
    name: "SignerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "shares",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "payees",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "splitter",
        type: "address",
      },
    ],
    name: "SplitterCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "colInfo",
    outputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "enum Types.ERC721Type",
        name: "colType",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "colSalt",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "blocknumber",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "splitter",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_tokenType",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "_tokenSalt",
        type: "string",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxSupply",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_baseURI",
        type: "string",
      },
      {
        internalType: "address",
        name: "_splitter",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_royalty",
        type: "uint256",
      },
    ],
    name: "createCollection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "creatorAuth",
    outputs: [
      {
        internalType: "bool",
        name: "stdout",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_colID",
        type: "bytes32",
      },
    ],
    name: "creatorCheck",
    outputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "check",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_colAddress",
        type: "address",
      },
    ],
    name: "getColID",
    outputs: [
      {
        internalType: "bytes32",
        name: "colID",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_salt",
        type: "string",
      },
    ],
    name: "getDeployedAddr",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getIDsLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "market",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_market",
        type: "address",
      },
    ],
    name: "setMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
    ],
    name: "setRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_signer",
        type: "address",
      },
    ],
    name: "setSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_splitterSalt",
        type: "string",
      },
      {
        internalType: "address",
        name: "_ambassador",
        type: "address",
      },
      {
        internalType: "address",
        name: "_project",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_ambShare",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_projectShare",
        type: "uint256",
      },
    ],
    name: "splitterCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "splitterInfo",
    outputs: [
      {
        internalType: "address",
        name: "splitter",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "splitterSalt",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "ambassador",
        type: "address",
      },
      {
        internalType: "address",
        name: "project",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "ambShare",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "projectShare",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "valid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_colID",
        type: "bytes32",
      },
    ],
    name: "typeChecker",
    outputs: [
      {
        internalType: "uint8",
        name: "pointer",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userTokens",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405260016000553480156200001657600080fd5b5060405162002b1b38038062002b1b833981016040819052620000399162000270565b3060601b608052600180546001600160a01b0319163390811790915560405181906000907f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d76908290a3506001805460ff60a01b191690556200009b83620000ba565b620000a68262000145565b620000b181620001cc565b505050620002b9565b6001546001600160a01b03163314620001095760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064015b60405180910390fd5b60068190556040516001600160a01b038216907f210690abd7fd6cdbb8f2beb202b2a253d58d7a0813b2175c4172c14c0c1af6dc90600090a250565b6001546001600160a01b03163314620001905760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b604482015260640162000100565b60058190556040516001600160a01b038216907f7aed1d3e8155a07ccf395e44ea3109a0e2d6c9b29bbbe9f142d9790596f4dc8090600090a250565b6001546001600160a01b03163314620002175760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b604482015260640162000100565b60078190556040516001600160a01b038216907f5553331329228fbd4123164423717a4a7539f6dfa1c3279a923b98fd681a6c7390600090a250565b80516001600160a01b03811681146200026b57600080fd5b919050565b60008060006060848603121562000285578283fd5b620002908462000253565b9250620002a06020850162000253565b9150620002b06040850162000253565b90509250925092565b60805160601c612843620002d86000396000611d5501526128436000f3fe608060405234801561001057600080fd5b50600436106101825760003560e01c80638da5cb5b116100d8578063bc8b58381161008c578063f887ea4011610066578063f887ea401461040b578063f9f411d81461041e578063fa2405171461043157600080fd5b8063bc8b5838146103c0578063c0d78655146103d3578063d93cb8fd146103e657600080fd5b80639750f2e0116100bd5780639750f2e0146102cc578063b64bd5eb1461037b578063b7762c6d146103ad57600080fd5b80638da5cb5b146102a657806395cd5193146102b957600080fd5b80636c19e7831161013a57806380f556051161011457806380f556051461024a5780638456cb59146102755780638691fe461461027d57600080fd5b80636c19e783146102115780636dcea85f1461022457806376de0f3d1461023757600080fd5b80633f4ba83a1161016b5780633f4ba83a146101ba5780635c975abb146101c2578063617d1d3b146101e057600080fd5b806306fdde031461018757806313af4035146101a5575b600080fd5b61018f61048f565b60405161019c91906125a9565b60405180910390f35b6101b86101b336600461220b565b6104a7565b005b6101b8610533565b600154600160a01b900460ff165b604051901515815260200161019c565b6102036101ee36600461220b565b60601b6bffffffffffffffffffffffff191690565b60405190815260200161019c565b6101b861021f36600461220b565b610586565b6101b861023236600461220b565b61060b565b6101d0610245366004612243565b610690565b60065461025d906001600160a01b031681565b6040516001600160a01b03909116815260200161019c565b6101b86107a2565b61020361028b36600461220b565b6001600160a01b031660009081526003602052604090205490565b60015461025d906001600160a01b031681565b6101b86102c736600461238f565b6107f3565b6103326102da366004612243565b6004602081815260009384526040808520909152918352912080546001820154600283015460038401549484015460058501546006909501546001600160a01b03948516969395928516949093169290919060ff1687565b604080516001600160a01b039889168152602081019790975294871694860194909452949091166060840152608083015260a082019290925290151560c082015260e00161019c565b61038e6103893660046122a6565b6110ae565b604080516001600160a01b03909316835290151560208301520161019c565b6101b86103bb36600461231d565b6110fa565b61025d6103ce3660046122e2565b611adc565b6101b86103e136600461220b565b611af6565b6103f96103f43660046122a6565b611b7b565b60405160ff909116815260200161019c565b60055461025d906001600160a01b031681565b61020361042c36600461227b565b611b9b565b61047e61043f3660046122a6565b600260208190526000918252604090912080546001820154928201546003909201546001600160a01b0380831694600160a01b90930460ff1693911685565b60405161019c9594939291906124c1565b6060602080526707666163746f727960475260606020f35b6001546001600160a01b031633146104f55760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064015b60405180910390fd5b60018190556040516001600160a01b0382169033907f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d7690600090a350565b6001546001600160a01b0316331461057c5760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016104ec565b610584611bcc565b565b6001546001600160a01b031633146105cf5760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016104ec565b60078190556040516001600160a01b038216907f5553331329228fbd4123164423717a4a7539f6dfa1c3279a923b98fd681a6c7390600090a250565b6001546001600160a01b031633146106545760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016104ec565b60068190556040516001600160a01b038216907f210690abd7fd6cdbb8f2beb202b2a253d58d7a0813b2175c4172c14c0c1af6dc90600090a250565b600061069a611c68565b6106a382611c9b565b6106ab575060005b6001600160a01b0382166000908152600360205260408120546bffffffffffffffffffffffff19606086901b16919067ffffffffffffffff81111561070057634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610729578160200160208202803683370190505b50805190915060009060035b81831015610797576001600160a01b038716600090815260208290526040902080548490811061077557634e487b7160e01b600052603260045260246000fd5b906000526020600020015485141561078c57600195505b826001019250610735565b505050505092915050565b6001546001600160a01b031633146107eb5760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016104ec565b610584611cc4565b6000546001146108325760405162461bcd60e51b815260206004820152600a6024820152695245454e5452414e435960b01b60448201526064016104ec565b600260005561083f611d4a565b600154600160a01b900460ff16156108825760405162461bcd60e51b815260206004820152600660248201526514105554d15160d21b60448201526064016104ec565b61088c8983611dc2565b61089581611e0e565b60018960ff161015610a9357600554604051630e2ff12160e21b8152600091829173__$b997b87af3d2e34e8c13da7c5c4bfea97a$__916338bfc484916108f6918e918e918e918c918f918d916001600160a01b0316908d90600401612704565b604080518083038186803b15801561090d57600080fd5b505af4158015610921573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061094591906122be565b90925090506000606082901b6bffffffffffffffffffffffff1916326000818152600360208181526040808420805460018101825590855282852001869055805160a0810182529485528482018481528582018a90524360608701526001600160a01b038c8116608088015287865260029093529320845181546001600160a01b03198116919093169081178255935195965093949284926001600160a81b03199092161790600160a01b908490811115610a1057634e487b7160e01b600052602160045260246000fd5b0217905550604082810151600183015560608301516002830155608090920151600390910180546001600160a01b0319166001600160a01b039283161790559051838216918716907fe2eaa55be692c8c2865b5eb0fc32098c334cafde2c9a8958a23357fe257b927190610a87908e908e90612654565b60405180910390a35050505b8860ff1660011415610c9657600554604051630121b9d960e01b8152600091829173__$785115ade85da2325a219769175abf82ff$__91630121b9d991610af8918e918e918e918c918f918f918e916001600160a01b03909116908e90600401612783565b604080518083038186803b158015610b0f57600080fd5b505af4158015610b23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b4791906122be565b90925090506000606082901b6bffffffffffffffffffffffff191632600081815260036020818152604080842080546001808201835591865283862001879055815160a0810183529586528583019081528582018a90524360608701526001600160a01b038c8116608088015287865260029093529320845181546001600160a01b03198116919093169081178255935195965093949284926001600160a81b03199092161790600160a01b908490811115610c1357634e487b7160e01b600052602160045260246000fd5b0217905550604082810151600183015560608301516002830155608090920151600390910180546001600160a01b0319166001600160a01b039283161790559051838216918716907fe93c3874cd65f1a8c0fafb266583c40c7b0c0bd2d96ddd70846baad58f80cd8a90610c8a908e908e90612654565b60405180910390a35050505b8860ff1660021415610e9b576005546040516307d99e5b60e11b8152600091829173__$3f62e828fa34ef2939e36d97e9ecccee8f$__91630fb33cb691610cfb918e918e918e918c918f918f918e916001600160a01b03909116908e90600401612783565b604080518083038186803b158015610d1257600080fd5b505af4158015610d26573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d4a91906122be565b90925090506000606082901b6bffffffffffffffffffffffff1916326000818152600360208181526040808420805460018101825590855282852001869055805160a08101825294855260028583018181528683018b90524360608801526001600160a01b038d81166080890152888752919093529320845181546001600160a01b03198116919095169081178255915195965093949284926001600160a81b031990911690911790600160a01b908490811115610e1857634e487b7160e01b600052602160045260246000fd5b0217905550604082810151600183015560608301516002830155608090920151600390910180546001600160a01b0319166001600160a01b039283161790559051838216918716907f1e886a605f4cac82d06ac48ccc9c3201217782b8f2030ecd8589c8ad356e911390610e8f908e908e90612654565b60405180910390a35050505b60028960ff16111561109e57600554600754604051634569563d60e01b8152600092839273__$8453101c277dcb246f5fde8e1e36aa4a24$__92634569563d92610f01928f928f928f928d928d926001600160a01b039081169216908d90600401612682565b604080518083038186803b158015610f1857600080fd5b505af4158015610f2c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f5091906122be565b90925090506000606082901b6bffffffffffffffffffffffff1916326000818152600360208181526040808420805460018101825590855282852001869055805160a0810182529485528482018381528582018a90524360608701526001600160a01b038c8116608088015287865260029093529320845181546001600160a01b03198116919093169081178255935195965093949284926001600160a81b03199092161790600160a01b90849081111561101b57634e487b7160e01b600052602160045260246000fd5b0217905550604082810151600183015560608301516002830155608090920151600390910180546001600160a01b0319166001600160a01b039283161790559051838216918716907f822c8de4e6bd4e9c971847d58598627a7b6da03382b13d71eca79f14b12cb0d890611092908e908e90612654565b60405180910390a35050505b5050600160005550505050505050565b6000806110b9611e30565b600083815260026020526040902080546001600160a01b03169250328314156110e157600191505b816110f457634ca888676000526004601cfd5b50915091565b6000546001146111395760405162461bcd60e51b815260206004820152600a6024820152695245454e5452414e435960b01b60448201526064016104ec565b6002600055611146611d4a565b600154600160a01b900460ff16156111895760405162461bcd60e51b815260206004820152600660248201526514105554d15160d21b60448201526064016104ec565b845160208601206001600160a01b0385161580156111ae57506001600160a01b038416155b1561137e576001546000906111cf90829081906001600160a01b0316611e63565b905060006111de600080611f57565b9050600073__$e0b3dea100c37e1c0d530933159e390817$__636ec6cf158a85856040518463ffffffff1660e01b815260040161121d939291906125bc565b60206040518083038186803b15801561123557600080fd5b505af4158015611249573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061126d9190612227565b6040805160e0810182526001600160a01b0380841680835260208084018a81526000858701818152606087018281526080880183815260a08901848152600160c08b01818152328088526004808b528e89209b89529a909952958c90209a518b54908b166001600160a01b0319918216178c559651908b0155925160028a018054918a1691871691909117905590516003890180549190981694169390931790955590519285019290925591516005840155516006909201805492151560ff19909316929092179091559051919250907f539b061603ad7342d8dffcd213ed3dc2afd3a1b9bc14e3ff19be01fa3416c6619061136e90859087908690612516565b60405180910390a2505050611acf565b6001600160a01b0385161580159061139d57506001600160a01b038416155b80156113a857508215155b80156113b45750601583105b15611615576001546000906113d590879083906001600160a01b0316611e63565b905060006113e4856000611f57565b9050600073__$e0b3dea100c37e1c0d530933159e390817$__636ec6cf158a85856040518463ffffffff1660e01b8152600401611423939291906125bc565b60206040518083038186803b15801561143b57600080fd5b505af415801561144f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114739190612227565b90506040518060e00160405280826001600160a01b03168152602001858152602001896001600160a01b0316815260200160006001600160a01b03168152602001878152602001600081526020016001151581525060046000326001600160a01b03166001600160a01b031681526020019081526020016000206000836001600160a01b03166001600160a01b0316815260200190815260200160002060008201518160000160006101000a8154816001600160a01b0302191690836001600160a01b031602179055506020820151816001015560408201518160020160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060608201518160030160006101000a8154816001600160a01b0302191690836001600160a01b031602179055506080820151816004015560a0820151816005015560c08201518160060160006101000a81548160ff021916908315150217905550905050326001600160a01b03167f539b061603ad7342d8dffcd213ed3dc2afd3a1b9bc14e3ff19be01fa3416c66183858460405161136e93929190612516565b6001600160a01b0384161580159061163457506001600160a01b038516155b801561163f57508115155b801561164b5750605b82105b156118ac5760015460009061166c90829087906001600160a01b0316611e63565b9050600061167b600085611f57565b9050600073__$e0b3dea100c37e1c0d530933159e390817$__636ec6cf158a85856040518463ffffffff1660e01b81526004016116ba939291906125bc565b60206040518083038186803b1580156116d257600080fd5b505af41580156116e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061170a9190612227565b90506040518060e00160405280826001600160a01b0316815260200185815260200160006001600160a01b03168152602001886001600160a01b03168152602001600081526020018681526020016001151581525060046000326001600160a01b03166001600160a01b031681526020019081526020016000206000836001600160a01b03166001600160a01b0316815260200190815260200160002060008201518160000160006101000a8154816001600160a01b0302191690836001600160a01b031602179055506020820151816001015560408201518160020160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060608201518160030160006101000a8154816001600160a01b0302191690836001600160a01b031602179055506080820151816004015560a0820151816005015560c08201518160060160006101000a81548160ff021916908315150217905550905050326001600160a01b03167f539b061603ad7342d8dffcd213ed3dc2afd3a1b9bc14e3ff19be01fa3416c66183858460405161136e93929190612516565b6001600160a01b038516158015906118cc57506001600160a01b03841615155b80156118d757508215155b80156118e35750601583105b80156118ee57508115155b80156118fa5750604782105b15611ac25760015460009061191b90879087906001600160a01b0316611e63565b905060006119298585611f57565b9050600073__$e0b3dea100c37e1c0d530933159e390817$__636ec6cf158a85856040518463ffffffff1660e01b8152600401611968939291906125bc565b60206040518083038186803b15801561198057600080fd5b505af4158015611994573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119b89190612227565b6040805160e0810182526001600160a01b0380841680835260208084018a81528e84168587019081528e851660608701908152608087018f815260a088018f8152600160c08a018181523260008181526004808b528e82209b82529a909952978c90209a518b54908b166001600160a01b0319918216178c559651918b0191909155935160028a018054918a1691871691909117905591516003890180549190981694169390931790955590519285019290925591516005840155516006909201805492151560ff19909316929092179091559051919250907f539b061603ad7342d8dffcd213ed3dc2afd3a1b9bc14e3ff19be01fa3416c6619061136e90859087908690612516565b62adecf06000526004601cfd5b5050600160005550505050565b80516020820120600090611aef8161205a565b9392505050565b6001546001600160a01b03163314611b3f5760405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b60448201526064016104ec565b60058190556040516001600160a01b038216907f7aed1d3e8155a07ccf395e44ea3109a0e2d6c9b29bbbe9f142d9790596f4dc8090600090a250565b6000611b85611e30565b5060009081526002602052604090205460a01c90565b60036020528160005260406000208181548110611bb757600080fd5b90600052602060002001600091509150505481565b600154600160a01b900460ff16611c255760405162461bcd60e51b815260206004820152600860248201527f554e50415553454400000000000000000000000000000000000000000000000060448201526064016104ec565b6001805460ff60a01b191690556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa906020015b60405180910390a1565b6006543314610584577f4ca88867ffffffffffffffffffffffffffffffffffffffffffffffffffffffff60005260046000fd5b6000604051600360208201528260408201526040812090508054611cbe57600091505b50919050565b600154600160a01b900460ff1615611d075760405162461bcd60e51b815260206004820152600660248201526514105554d15160d21b60448201526064016104ec565b6001805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602001611c5e565b306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146105845760405162461bcd60e51b815260206004820152600860248201527f4241445f43414c4c00000000000000000000000000000000000000000000000060448201526064016104ec565b3260009081526004602090815260408083206001600160a01b038516845290915290206006015460ff166003831181151715611e0957634ca8886760e01b60005260046000fd5b505050565b6019810615156103e882111715611e2d5763e0e54ced6000526004601cfd5b50565b6005543314610584577f4ca88867ffffffffffffffffffffffffffffffffffffffffffffffffffffffff60005260046000fd5b6060821584151660018114611e7d578015611ea157611f4f565b60405191506002600083015282602083015232604083015260608201604052611f4f565b831560018114611eb6578015611ee057611f4d565b60405192506003600084015283602084015285604084015232606084015260808301604052611f4d565b851560018114611ef5578015611f1f57611f4b565b60405193506003600085015284602085015285604085015232606085015260808401604052611f4b565b60405193506004600085015284602085015286604085015285606085015232608085015260a084016040525b505b505b509392505050565b6060811583151660018114611f71578015611f9757612053565b604051915060026000830152600a6020830152605a604083015260608201604052612053565b821560018114611fac578015611fda57612051565b604051925060036000840152600a602084015284604084015284605a03606084015260808301604052612051565b841560018114611fef57801561201d5761204f565b604051935060036000850152600a602085015284604085015284605a0360608501526080840160405261204f565b604051935060046000850152600a6020850152856040850152846060850152848601605a03608085015260a084016040525b505b505b5092915050565b604080518082018252601081527f67363d3d37363d34f03d5260086018f30000000000000000000000000000000060209182015290517fff00000000000000000000000000000000000000000000000000000000000000918101919091526bffffffffffffffffffffffff193060601b166021820152603581018290527f21c35dbe1b344a2488cf3321d6ce542f8e9f305544ff09e4993a62319a497c1f60558201526000908190612123906075015b6040516020818303038152906040528051906020012090565b6040516135a560f21b60208201526bffffffffffffffffffffffff19606083901b166022820152600160f81b6036820152909150611aef9060370161210a565b803561216e81612821565b919050565b600082601f830112612183578081fd5b813567ffffffffffffffff8082111561219e5761219e61280b565b604051601f8301601f19908116603f011681019082821181831017156121c6576121c661280b565b816040528381528660208588010111156121de578485fd5b8360208701602083013792830160200193909352509392505050565b803560ff8116811461216e57600080fd5b60006020828403121561221c578081fd5b8135611aef81612821565b600060208284031215612238578081fd5b8151611aef81612821565b60008060408385031215612255578081fd5b823561226081612821565b9150602083013561227081612821565b809150509250929050565b6000806040838503121561228d578182fd5b823561229881612821565b946020939093013593505050565b6000602082840312156122b7578081fd5b5035919050565b600080604083850312156122d0578182fd5b82519150602083015161227081612821565b6000602082840312156122f3578081fd5b813567ffffffffffffffff811115612309578182fd5b61231584828501612173565b949350505050565b600080600080600060a08688031215612334578081fd5b853567ffffffffffffffff81111561234a578182fd5b61235688828901612173565b955050602086013561236781612821565b9350604086013561237781612821565b94979396509394606081013594506080013592915050565b60008060008060008060008060006101208a8c0312156123ad578384fd5b6123b68a6121fa565b985060208a013567ffffffffffffffff808211156123d2578586fd5b6123de8d838e01612173565b995060408c01359150808211156123f3578586fd5b6123ff8d838e01612173565b985060608c0135915080821115612414578586fd5b6124208d838e01612173565b975060808c0135965060a08c0135955060c08c0135915080821115612443578485fd5b506124508c828d01612173565b93505061245f60e08b01612163565b91506101008a013590509295985092959850929598565b60008151808452815b8181101561249b5760208185018101518683018201520161247f565b818111156124ac5782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b03868116825260a0820190600487106124f157634e487b7160e01b600052602160045260246000fd5b8660208401528560408401528460608401528084166080840152509695505050505050565b606080825284519082018190526000906020906080840190828801845b8281101561254f57815184529284019290840190600101612533565b50505083810382850152855180825286830191830190845b8181101561258e5783516001600160a01b0316835260208301938501939250600101612567565b50506001600160a01b03861660408601529250612315915050565b602081526000611aef6020830184612476565b6060815260006125cf6060830186612476565b828103602084810191909152855180835286820192820190845b818110156126105784516001600160a01b03168352602083019484019492506001016125e9565b505084810360408601528551808252908201925081860190845b818110156126465782518552938301939183019160010161262a565b509298975050505050505050565b6040815260006126676040830185612476565b82810360208401526126798185612476565b95945050505050565b60006101008083526126968184018c612476565b905082810360208401526126aa818b612476565b905082810360408401526126be818a612476565b905082810360608401526126d28189612476565b6001600160a01b03978816608085015295871660a084015250509190931660c082015260e00191909152949350505050565b60006101008083526127188184018c612476565b9050828103602084015261272c818b612476565b90508281036040840152612740818a612476565b905082810360608401526127548189612476565b608084019790975250506001600160a01b0393841660a08201529190921660c082015260e00152949350505050565b60006101208083526127978184018d612476565b905082810360208401526127ab818c612476565b905082810360408401526127bf818b612476565b905082810360608401526127d3818a612476565b6080840198909852505060a08101949094526001600160a01b0392831660c0850152911660e083015261010090910152949350505050565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114611e2d57600080fdfea164736f6c6343000804000a";

type MADFactory721ConstructorParams =
  | [linkLibraryAddresses: MADFactory721LibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MADFactory721ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class MADFactory721__factory extends ContractFactory {
  constructor(...args: MADFactory721ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(
        _abi,
        MADFactory721__factory.linkBytecode(linkLibraryAddresses),
        signer
      );
    }
  }

  static linkBytecode(
    linkLibraryAddresses: MADFactory721LibraryAddresses
  ): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$b997b87af3d2e34e8c13da7c5c4bfea97a\\$__", "g"),
      linkLibraryAddresses[
        "contracts/lib/deployers/ERC721Deployer.sol:ERC721MinimalDeployer"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$785115ade85da2325a219769175abf82ff\\$__", "g"),
      linkLibraryAddresses[
        "contracts/lib/deployers/ERC721Deployer.sol:ERC721BasicDeployer"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$3f62e828fa34ef2939e36d97e9ecccee8f\\$__", "g"),
      linkLibraryAddresses[
        "contracts/lib/deployers/ERC721Deployer.sol:ERC721WhitelistDeployer"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$8453101c277dcb246f5fde8e1e36aa4a24\\$__", "g"),
      linkLibraryAddresses[
        "contracts/lib/deployers/ERC721Deployer.sol:ERC721LazyDeployer"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$e0b3dea100c37e1c0d530933159e390817\\$__", "g"),
      linkLibraryAddresses[
        "contracts/lib/deployers/SplitterDeployer.sol:SplitterDeployer"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  override deploy(
    _marketplace: PromiseOrValue<string>,
    _router: PromiseOrValue<string>,
    _signer: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MADFactory721> {
    return super.deploy(
      _marketplace,
      _router,
      _signer,
      overrides || {}
    ) as Promise<MADFactory721>;
  }
  override getDeployTransaction(
    _marketplace: PromiseOrValue<string>,
    _router: PromiseOrValue<string>,
    _signer: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _marketplace,
      _router,
      _signer,
      overrides || {}
    );
  }
  override attach(address: string): MADFactory721 {
    return super.attach(address) as MADFactory721;
  }
  override connect(signer: Signer): MADFactory721__factory {
    return super.connect(signer) as MADFactory721__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MADFactory721Interface {
    return new utils.Interface(_abi) as MADFactory721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MADFactory721 {
    return new Contract(address, _abi, signerOrProvider) as MADFactory721;
  }
}

export interface MADFactory721LibraryAddresses {
  ["contracts/lib/deployers/ERC721Deployer.sol:ERC721MinimalDeployer"]: string;
  ["contracts/lib/deployers/ERC721Deployer.sol:ERC721BasicDeployer"]: string;
  ["contracts/lib/deployers/ERC721Deployer.sol:ERC721WhitelistDeployer"]: string;
  ["contracts/lib/deployers/ERC721Deployer.sol:ERC721LazyDeployer"]: string;
  ["contracts/lib/deployers/SplitterDeployer.sol:SplitterDeployer"]: string;
}
