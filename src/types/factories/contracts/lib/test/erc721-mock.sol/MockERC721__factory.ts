/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../../../common";
import type {
  MockERC721,
  MockERC721Interface,
} from "../../../../../contracts/lib/test/erc721-mock.sol/MockERC721";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
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
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "owner",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
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
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    ],
    name: "tokenURI",
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
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234620003195762000faa803803806200001d816200031e565b928339810190604081830312620003195780516001600160401b03908181116200031957836200004f91840162000344565b916020938482015183811162000319576200006b920162000344565b825190828211620003035760008054926001958685811c95168015620002f8575b88861014620002e4578190601f9586811162000291575b5088908683116001146200022d57849262000221575b5050600019600383901b1c191690861b1781555b81519384116200020d5784548581811c9116801562000202575b87821014620001ee57838111620001a6575b50859284116001146200014157839495509262000135575b5050600019600383901b1c191690821b1790555b604051610bf39081620003b78239f35b01519050388062000111565b9190601f1984169585845280842093905b8782106200018e5750508385961062000174575b505050811b01905562000125565b015160001960f88460031b161c1916905538808062000166565b80878596829496860151815501950193019062000152565b8582528682208480870160051c820192898810620001e4575b0160051c019086905b828110620001d8575050620000f9565b838155018690620001c8565b92508192620001bf565b634e487b7160e01b82526022600452602482fd5b90607f1690620000e7565b634e487b7160e01b81526041600452602490fd5b015190503880620000b9565b8480528985208994509190601f198416865b8c8282106200027a575050841162000260575b505050811b018155620000cd565b015160001960f88460031b161c1916905538808062000252565b8385015186558c979095019493840193016200023f565b9091508380528884208680850160051c8201928b8610620002da575b918a91869594930160051c01915b828110620002cb575050620000a3565b8681558594508a9101620002bb565b92508192620002ad565b634e487b7160e01b83526022600452602483fd5b94607f16946200008c565b634e487b7160e01b600052604160045260246000fd5b600080fd5b6040519190601f01601f191682016001600160401b038111838210176200030357604052565b919080601f84011215620003195782516001600160401b03811162000303576020906200037a601f8201601f191683016200031e565b92818452828287010111620003195760005b818110620003a257508260009394955001015290565b85810183015184820184015282016200038c56fe608060408181526004918236101561001657600080fd5b600092833560e01c91826301ffc9a7146108655750816306fdde03146107a8578163081812fc14610776578163095ea7b3146106c557816323b872dd146106ac57816340c10f19146105d857816342842e0e1461051c5781636352211e146104ae57816370a082311461043b57816395d89b411461033b578163a22cb465146102b7578163b88d4fde1461016c57508063c87b56dd1461010f5763e985e9c5146100bf57600080fd5b3461010b578060031936011261010b5760ff816020936100dd610951565b6100e561096c565b6001600160a01b0391821683526005875283832091168252855220549151911615158152f35b5080fd5b503461010b5760208060031936011261016857918151928391818352606051918281850152815b838110610153575050828201840152601f01601f19168101030190f35b60808101518782018701528694508101610136565b8280fd5b90503461016857608036600319011261016857610187610951565b61018f61096c565b6044359267ffffffffffffffff916064358381116102b357366023820112156102b357808301359384116102b35736602485830101116102b3576101d4868387610a34565b87823b159586156101ee575b50876101eb87610b7e565b51f35b602494965060a486986020978b519a8b9889978894630a85bd0160e11b9d8e8752339087015260018060a01b038098168387015260448601526080606486015282608486015201848401378181018301859052601f01601f19168101030193165af180156102a6576101eb928591610278575b506001600160e01b031916143880808087816101e0565b610299915060203d811161029f575b61029181836108d0565b810190610b5e565b38610261565b503d610287565b50505051903d90823e3d90fd5b8780fd5b50503461010b578060031936011261010b576102d1610951565b6024358015158091036103375733845260056020528284209160018060a01b03169182855260205282842060ff1981541660ff831617905582519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a351f35b8380fd5b9190503461016857826003193601126101685780519183600180549182821c928281168015610431575b602095868610821461041e57508488529081156103fc57506001146103a4575b6103a08686610396828b03836108d0565b5191829182610908565b0390f35b9295508083527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b8284106103e957505050826103a094610396928201019438610385565b80548685018801529286019281016103cc565b60ff191687860152505050151560051b8301019250610396826103a038610385565b634e487b7160e01b845260229052602483fd5b93607f1693610365565b8391503461010b57602036600319011261010b576001600160a01b0361045f610951565b1690811561047c5760208480858581526003845220549051908152f35b606490602085519162461bcd60e51b8352820152600c60248201526b5a45524f5f4144445245535360a01b6044820152fd5b9050823461051957602036600319011261051957813581526002602052829020546001600160a01b03169081156104e9575060209151908152f35b606490602084519162461bcd60e51b8352820152600a6024820152691393d517d3525395115160b21b6044820152fd5b80fd5b9050346101685761052c36610982565b91929061053a838286610a34565b803b15928315610550575b86866101eb86610b7e565b602092935060a4908787519687948593630a85bd0160e11b98898652339086015260018060a01b038093166024860152604485015260806064850152826084850152165af180156102a6576101eb9285916105ba575b506001600160e01b03191614388080610545565b6105d2915060203d811161029f5761029181836108d0565b386105a6565b9050346101685781600319360112610168576105f2610951565b6001600160a01b039081169260243592909161060f8515156109f4565b8386526002602052828620541661067957508284526003602052808420600181540190558184526002602052808420836001600160601b0360a01b8254161790555191837fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8185a4f35b6020606492519162461bcd60e51b8352820152600e60248201526d1053149150511657d3525395115160921b6044820152fd5b50503461010b576101eb6106bf36610982565b91610a34565b919050346101685780600319360112610168576106e0610951565b6024358085526002602052828520546001600160a01b03908116949193913386148015610757575b610711906109b7565b848752602052818620921691826001600160601b0360a01b82541617905551927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258585a4f35b508587526005602090815283882033895290528287205460ff16610708565b90503461016857602036600319011261016857803583526020908152918190205490516001600160a01b039091168152f35b919050346101685782600319360112610168578051918380549060019082821c92828116801561085b575b602095868610821461041e57508488529081156103fc5750600114610803576103a08686610396828b03836108d0565b8080949750527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b82841061084857505050826103a094610396928201019438610385565b805486850188015292860192810161082b565b93607f16936107d3565b849134610168576020366003190112610168573563ffffffff60e01b811680910361016857602092506301ffc9a760e01b81149081156108bf575b81156108ae575b5015158152f35b635b5e139f60e01b149050836108a7565b6380ac58cd60e01b811491506108a0565b90601f8019910116810190811067ffffffffffffffff8211176108f257604052565b634e487b7160e01b600052604160045260246000fd5b6020808252825181830181905290939260005b82811061093d57505060409293506000838284010152601f8019910116010190565b81810186015184820160400152850161091b565b600435906001600160a01b038216820361096757565b600080fd5b602435906001600160a01b038216820361096757565b6060906003190112610967576001600160a01b0390600435828116810361096757916024359081168103610967579060443590565b156109be57565b60405162461bcd60e51b815260206004820152600e60248201526d1393d517d055551213d49256915160921b6044820152606490fd5b156109fb57565b60405162461bcd60e51b81526020600482015260116024820152701253959053125117d49150d25412515395607a1b6044820152606490fd5b6000838152600260209081526040808320546001600160a01b0395948616949192919086168503610b2e5790610aad867fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9594931696610a958815156109f4565b863314908115610b11575b8115610afb575b506109b7565b84835260038152818320600019815401905585835281832060018154019055868352600281526004828420916001600160601b0360a01b9288848254161790555281832090815416905551a4565b9050888552600483528385205416331438610aa7565b8786526005845284862033875284528486205460ff169150610aa0565b50606491519062461bcd60e51b82526004820152600a60248201526957524f4e475f46524f4d60b01b6044820152fd5b9081602091031261096757516001600160e01b0319811681036109675790565b15610b8557565b60405162461bcd60e51b815260206004820152601060248201526f155394d0519157d49150d2541251539560821b6044820152606490fdfea2646970667358221220a798706e5f350bc0f04cc2b9312f0596923da0e677da6f0990625c2d6db4453264736f6c63430008100033";

type MockERC721ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockERC721ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockERC721__factory extends ContractFactory {
  constructor(...args: MockERC721ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MockERC721> {
    return super.deploy(_name, _symbol, overrides || {}) as Promise<MockERC721>;
  }
  override getDeployTransaction(
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_name, _symbol, overrides || {});
  }
  override attach(address: string): MockERC721 {
    return super.attach(address) as MockERC721;
  }
  override connect(signer: Signer): MockERC721__factory {
    return super.connect(signer) as MockERC721__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockERC721Interface {
    return new utils.Interface(_abi) as MockERC721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockERC721 {
    return new Contract(address, _abi, signerOrProvider) as MockERC721;
  }
}
