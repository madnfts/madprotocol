/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../../../common";
import type {
  MockERC2981,
  MockERC2981Interface,
} from "../../../../../contracts/lib/test/erc2981-mock.sol/MockERC2981";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
        indexed: true,
        internalType: "uint256",
        name: "newRoyaltyFee",
        type: "uint256",
      },
    ],
    name: "RoyaltyFeeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newRecipient",
        type: "address",
      },
    ],
    name: "RoyaltyRecipientSet",
    type: "event",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "salePrice",
        type: "uint256",
      },
    ],
    name: "royaltyInfo",
    outputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "royaltyAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "setRoyaltyFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "setRoyaltyRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080346100f957601f61043c38819003918201601f19168301916001600160401b038311848410176100fe5780849260409485528339810103126100f95780516020909101516001600160a01b03811691908290036100f95760018060a01b0319913383600254161760025580604051933360007f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d768188a360015416176001557f2a5a1009e36beb67c3a1ada61dd1343d7e9ec62c70965492fbaa06234f8316b1600084a2806000557fc36422dcc77a5c93a5c48743078f8130c9fcc2a0ff893904ee62a3565688117c600083a261032790816101158239f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060408181526004918236101561001657600080fd5b600092833560e01c91826301ffc9a7146102635750816313af4035146101c05781632a55205a146101605781633e4086e51461010b57816341e42f30146100925750638da5cb5b1461006757600080fd5b3461008e578160031936011261008e5760025490516001600160a01b039091168152602090f35b5080fd5b90503461010757602036600319011261010757356001600160a01b038181169291839003610103576100c9906002541633146102b6565b600180546001600160a01b0319168317905551907f2a5a1009e36beb67c3a1ada61dd1343d7e9ec62c70965492fbaa06234f8316b18383a2f35b8380fd5b8280fd5b90503461010757602036600319011261010757359061013560018060a01b036002541633146102b6565b81835551907fc36422dcc77a5c93a5c48743078f8130c9fcc2a0ff893904ee62a3565688117c8383a2f35b8284346101bd57816003193601126101bd5760015481546001600160a01b0390911691602435906000198290048311821515166101aa575083519283526127109102046020820152f35b634e487b7160e01b815260118652602490fd5b80fd5b919050346101075760203660031901126101075781356001600160a01b03818116939084830361025f576101f9906002541633146102b6565b831561022c57506002555190337f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d768484a3f35b606490602084519162461bcd60e51b8352820152600d60248201526c24b73b30b634b21037bbb732b960991b6044820152fd5b8580fd5b849134610107576020366003190112610107573563ffffffff60e01b811680910361010757602092506301ffc9a760e01b81149081156102a5575b5015158152f35b63152a902d60e11b1490508361029e565b156102bd57565b60405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b6044820152606490fdfea2646970667358221220118894d84b37cbc46f549103b17347bbad22e9b5a3e0da65d5f62c73fbc9055964736f6c63430008100033";

type MockERC2981ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockERC2981ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockERC2981__factory extends ContractFactory {
  constructor(...args: MockERC2981ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    fee: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MockERC2981> {
    return super.deploy(
      fee,
      recipient,
      overrides || {}
    ) as Promise<MockERC2981>;
  }
  override getDeployTransaction(
    fee: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(fee, recipient, overrides || {});
  }
  override attach(address: string): MockERC2981 {
    return super.attach(address) as MockERC2981;
  }
  override connect(signer: Signer): MockERC2981__factory {
    return super.connect(signer) as MockERC2981__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockERC2981Interface {
    return new utils.Interface(_abi) as MockERC2981Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockERC2981 {
    return new Contract(address, _abi, signerOrProvider) as MockERC2981;
  }
}
