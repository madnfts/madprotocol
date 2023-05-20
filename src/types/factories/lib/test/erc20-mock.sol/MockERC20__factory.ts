/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../../common";
import type {
  MockERC20,
  MockERC20Interface,
} from "../../../../lib/test/erc20-mock.sol/MockERC20";
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
        name: "amountToMint",
        type: "uint256",
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
        indexed: false,
        internalType: "uint256",
        name: "amount",
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
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
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
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
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
        name: "value",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60e0604081815234620004925781620012d08038038091620000228285620004c9565b8339602093849181010312620004925751815190620000418262000497565b600493848352634d6f636b60e01b81840152835191620000618362000497565b858352634d4f434b60e01b8284015283516001600160401b03949093908585116200047d5760009480620000968754620004ed565b92601f938481116200042c575b508690848311600114620003c4578892620003b8575b50508160011b916000199060031b1c19161785555b815190868211620003a5578190600193620000ea8554620004ed565b82811162000350575b5086918311600114620002ec578792620002e0575b5050600019600383901b1c191690821b1781555b60126080524660a052855184549181866200013785620004ed565b9283835287830195888282169182600014620002c057505060011462000280575b506200016792500382620004c9565b5190208551838101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8352878201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a0815260c0810195818710908711176200026d5785875251902060c0526002548181018091116200025a57907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92916002553384526003825285842081815401905584523393a351610da590816200052b82396080518161077e015260a05181610b97015260c05181610bbe0152f35b634e487b7160e01b845260118752602484fd5b634e487b7160e01b855260418852602485fd5b8791508880528189209089915b858310620002a75750506200016793508201013862000158565b805483880185015286945089939092019181016200028d565b60ff191688526200016795151560051b8501019250389150620001589050565b01519050388062000108565b8488528688208594509190601f198416895b898282106200033957505084116200031f575b505050811b0181556200011c565b015160001960f88460031b161c1916905538808062000311565b8385015186558897909501949384019301620002fe565b909192508488528688208380860160051c8201928987106200039b575b91869588929594930160051c01915b8281106200038c575050620000f3565b8a81558695508791016200037c565b925081926200036d565b634e487b7160e01b865260418952602486fd5b015190503880620000b9565b8880528789209250601f198416895b8982821062000415575050908460019594939210620003fb575b505050811b018555620000ce565b015160001960f88460031b161c19169055388080620003ed565b6001859682939686015181550195019301620003d3565b9091508780528688208480850160051c82019289861062000473575b9085949392910160051c01905b818110620004645750620000a3565b89815584935060010162000455565b9250819262000448565b604188634e487b7160e01b6000525260246000fd5b600080fd5b604081019081106001600160401b03821117620004b357604052565b634e487b7160e01b600052604160045260246000fd5b601f909101601f19168101906001600160401b03821190821017620004b357604052565b90600182811c921680156200051f575b60208310146200050957565b634e487b7160e01b600052602260045260246000fd5b91607f1691620004fd56fe6080604081815260048036101561001557600080fd5b600092833560e01c90816306fdde031461093c57508063095ea7b3146108c057806318160ddd146108a157806323b872dd146107a2578063313ce567146107645780633644e5151461074057806340c10f191461068f57806370a082311461064b5780637ecebe001461060757806395d89b411461050a578381639dc29fac1461048857508063a9059cbb146103f9578063d505accf146101175763dd62ed3e146100bf57600080fd5b3461011357816003193601126101135760209282916100dc610b0b565b6100e4610b33565b9173ffffffffffffffffffffffffffffffffffffffff8092168452865283832091168252845220549051908152f35b8280fd5b509190346103f55760e06003193601126103f557610133610b0b565b9061013c610b33565b91604435606435926084359260ff84168094036103f15742851061039457610162610b92565b9573ffffffffffffffffffffffffffffffffffffffff8092169586895260209560058752848a209889549960018b01905585519285898501957f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c987528b89870152169a8b606086015288608086015260a085015260c084015260c0835260e0830167ffffffffffffffff948482108683111761036757818852845190206101008501927f19010000000000000000000000000000000000000000000000000000000000008452610102860152610122850152604281526101608401948186109086111761033b57848752519020835261018082015260a4356101a082015260c4356101c0909101528780528490889060809060015afa15610331578651169687151580610328575b156102cd5786977f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259596975283528087208688528352818188205551908152a380f35b8360649251917f08c379a0000000000000000000000000000000000000000000000000000000008352820152600e60248201527f494e56414c49445f5349474e45520000000000000000000000000000000000006044820152fd5b5084881461028a565b81513d88823e3d90fd5b60248c60418f7f4e487b7100000000000000000000000000000000000000000000000000000000835252fd5b5060248c60418f7f4e487b7100000000000000000000000000000000000000000000000000000000835252fd5b60648860208451917f08c379a0000000000000000000000000000000000000000000000000000000008352820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152fd5b8680fd5b5080fd5b5050346103f557806003193601126103f557602091610416610b0b565b8273ffffffffffffffffffffffffffffffffffffffff6024359233855260038752828520610445858254610b56565b90551692838152600386522081815401905582519081527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef843392a35160018152f35b8084346105075780600319360112610507577fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60206104c5610b0b565b73ffffffffffffffffffffffffffffffffffffffff602435911693848652600383528086206104f5838254610b56565b9055816002540360025551908152a380f35b50fd5b5050346103f557816003193601126103f55780519082600180549161052e836109e2565b808652928281169081156105c15750600114610565575b50505061055782610561940383610a35565b5191829182610aa5565b0390f35b94508085527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b8286106105a9575050506105578260206105619582010194610545565b8054602087870181019190915290950194810161058c565b6105619750869350602092506105579491507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001682840152151560051b82010194610545565b5050346103f55760206003193601126103f5578060209273ffffffffffffffffffffffffffffffffffffffff61063b610b0b565b1681526005845220549051908152f35b5050346103f55760206003193601126103f5578060209273ffffffffffffffffffffffffffffffffffffffff61067f610b0b565b1681526003845220549051908152f35b50346101135781600319360112610113576106a8610b0b565b60243591600254908382018092116107145750849273ffffffffffffffffffffffffffffffffffffffff7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9360209360025516948585526003835280852082815401905551908152a380f35b8560116024927f4e487b7100000000000000000000000000000000000000000000000000000000835252fd5b5050346103f557816003193601126103f55760209061075d610b92565b9051908152f35b5050346103f557816003193601126103f5576020905160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b50913461089e57606060031936011261089e576107bd610b0b565b7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6107e6610b33565b946044358573ffffffffffffffffffffffffffffffffffffffff80951694858752602098848a958652838920338a52865283892054857fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361087b575b5050508688526003855282882061085c858254610b56565b9055169586815260038452208181540190558551908152a35160018152f35b61088491610b56565b90888a528652838920338a52865283892055388085610844565b80fd5b5050346103f557816003193601126103f5576020906002549051908152f35b50346101135781600319360112610113576020926108dc610b0b565b9183602435928392338252875273ffffffffffffffffffffffffffffffffffffffff8282209516948582528752205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b8490843461011357826003193601126101135782805461095b816109e2565b808552916001918083169081156105c157506001146109865750505061055782610561940383610a35565b80809650527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8286106109ca575050506105578260206105619582010194610545565b805460208787018101919091529095019481016109ad565b90600182811c92168015610a2b575b60208310146109fc57565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b91607f16916109f1565b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff821117610a7657604052565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60208082528251818301819052939260005b858110610af7575050507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8460006040809697860101520116010190565b818101830151848201604001528201610ab7565b6004359073ffffffffffffffffffffffffffffffffffffffff82168203610b2e57565b600080fd5b6024359073ffffffffffffffffffffffffffffffffffffffff82168203610b2e57565b91908203918211610b6357565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000467f000000000000000000000000000000000000000000000000000000000000000003610be057507f000000000000000000000000000000000000000000000000000000000000000090565b60405181548291610bf0826109e2565b8082528160209485820194600190878282169182600014610d33575050600114610cda575b50610c2292500382610a35565b51902091604051918201927f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f845260408301527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608301524660808301523060a083015260a0825260c082019082821067ffffffffffffffff831117610cad575060405251902090565b807f4e487b7100000000000000000000000000000000000000000000000000000000602492526041600452fd5b87805286915087907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b858310610d1b575050610c22935082010138610c15565b80548388018501528694508893909201918101610d04565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00168852610c2295151560051b8501019250389150610c15905056fea26469706673582212207620ade4f4bf2212d300e0a91a61f8c95f8e59dd042e3b331a6d83fa0250d2d164736f6c63430008130033";

type MockERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockERC20__factory extends ContractFactory {
  constructor(...args: MockERC20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    amountToMint: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MockERC20> {
    return super.deploy(amountToMint, overrides || {}) as Promise<MockERC20>;
  }
  override getDeployTransaction(
    amountToMint: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(amountToMint, overrides || {});
  }
  override attach(address: string): MockERC20 {
    return super.attach(address) as MockERC20;
  }
  override connect(signer: Signer): MockERC20__factory {
    return super.connect(signer) as MockERC20__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockERC20Interface {
    return new utils.Interface(_abi) as MockERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockERC20 {
    return new Contract(address, _abi, signerOrProvider) as MockERC20;
  }
}
