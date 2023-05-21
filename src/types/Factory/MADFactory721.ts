/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export interface MADFactory721Interface extends utils.Interface {
  functions: {
    "addColType(uint256,bytes)": FunctionFragment;
    "colInfo(bytes32)": FunctionFragment;
    "colTypes(uint256)": FunctionFragment;
    "createCollection(uint8,string,string,string,uint256,uint256,string,address,uint96,bytes32[])": FunctionFragment;
    "creatorAuth(address,address)": FunctionFragment;
    "creatorCheck(bytes32)": FunctionFragment;
    "erc20()": FunctionFragment;
    "getColID(address)": FunctionFragment;
    "getDeployedAddr(string,address)": FunctionFragment;
    "getIDsLength(address)": FunctionFragment;
    "market()": FunctionFragment;
    "name()": FunctionFragment;
    "owner()": FunctionFragment;
    "router()": FunctionFragment;
    "setMarket(address)": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "setRouter(address)": FunctionFragment;
    "setSigner(address)": FunctionFragment;
    "signer()": FunctionFragment;
    "splitterCheck(string,address,address,uint256,uint256)": FunctionFragment;
    "splitterInfo(address,address)": FunctionFragment;
    "typeChecker(bytes32)": FunctionFragment;
    "userTokens(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addColType"
      | "colInfo"
      | "colTypes"
      | "createCollection"
      | "creatorAuth"
      | "creatorCheck"
      | "erc20"
      | "getColID"
      | "getDeployedAddr"
      | "getIDsLength"
      | "market"
      | "name"
      | "owner"
      | "router"
      | "setMarket"
      | "setOwner"
      | "setRouter"
      | "setSigner"
      | "signer"
      | "splitterCheck"
      | "splitterInfo"
      | "typeChecker"
      | "userTokens"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addColType",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "colInfo",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "colTypes",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "createCollection",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "creatorAuth",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "creatorCheck",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "erc20", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getColID",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDeployedAddr",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getIDsLength",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "market", values?: undefined): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "router", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setMarket",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setRouter",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setSigner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "signer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "splitterCheck",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "splitterInfo",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "typeChecker",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "userTokens",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "addColType", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "colInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "colTypes", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createCollection",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "creatorAuth",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "creatorCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "erc20", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getColID", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDeployedAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getIDsLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "market", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "router", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setMarket", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setRouter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setSigner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "signer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "splitterCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "splitterInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "typeChecker",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "userTokens", data: BytesLike): Result;

  events: {
    "ColTypeUpdated(uint256)": EventFragment;
    "ERC721BasicCreated(address,address,string,string,uint256,uint256,uint256)": EventFragment;
    "FeesUpdated(uint256,uint256)": EventFragment;
    "MarketplaceUpdated(address)": EventFragment;
    "OwnerUpdated(address,address)": EventFragment;
    "PaymentTokenUpdated(address)": EventFragment;
    "RecipientUpdated(address)": EventFragment;
    "RouterUpdated(address)": EventFragment;
    "SignerUpdated(address)": EventFragment;
    "SplitterCreated(address,uint256[],address[],address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ColTypeUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ERC721BasicCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FeesUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MarketplaceUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnerUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PaymentTokenUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RecipientUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RouterUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SignerUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SplitterCreated"): EventFragment;
}

export interface ColTypeUpdatedEventObject {
  index: BigNumber;
}
export type ColTypeUpdatedEvent = TypedEvent<
  [BigNumber],
  ColTypeUpdatedEventObject
>;

export type ColTypeUpdatedEventFilter = TypedEventFilter<ColTypeUpdatedEvent>;

export interface ERC721BasicCreatedEventObject {
  newSplitter: string;
  newCollection: string;
  name: string;
  symbol: string;
  royalties: BigNumber;
  maxSupply: BigNumber;
  mintPrice: BigNumber;
}
export type ERC721BasicCreatedEvent = TypedEvent<
  [string, string, string, string, BigNumber, BigNumber, BigNumber],
  ERC721BasicCreatedEventObject
>;

export type ERC721BasicCreatedEventFilter =
  TypedEventFilter<ERC721BasicCreatedEvent>;

export interface FeesUpdatedEventObject {
  feeVal2: BigNumber;
  feeVal3: BigNumber;
}
export type FeesUpdatedEvent = TypedEvent<
  [BigNumber, BigNumber],
  FeesUpdatedEventObject
>;

export type FeesUpdatedEventFilter = TypedEventFilter<FeesUpdatedEvent>;

export interface MarketplaceUpdatedEventObject {
  newMarket: string;
}
export type MarketplaceUpdatedEvent = TypedEvent<
  [string],
  MarketplaceUpdatedEventObject
>;

export type MarketplaceUpdatedEventFilter =
  TypedEventFilter<MarketplaceUpdatedEvent>;

export interface OwnerUpdatedEventObject {
  user: string;
  newOwner: string;
}
export type OwnerUpdatedEvent = TypedEvent<
  [string, string],
  OwnerUpdatedEventObject
>;

export type OwnerUpdatedEventFilter = TypedEventFilter<OwnerUpdatedEvent>;

export interface PaymentTokenUpdatedEventObject {
  newPaymentToken: string;
}
export type PaymentTokenUpdatedEvent = TypedEvent<
  [string],
  PaymentTokenUpdatedEventObject
>;

export type PaymentTokenUpdatedEventFilter =
  TypedEventFilter<PaymentTokenUpdatedEvent>;

export interface RecipientUpdatedEventObject {
  newRecipient: string;
}
export type RecipientUpdatedEvent = TypedEvent<
  [string],
  RecipientUpdatedEventObject
>;

export type RecipientUpdatedEventFilter =
  TypedEventFilter<RecipientUpdatedEvent>;

export interface RouterUpdatedEventObject {
  newRouter: string;
}
export type RouterUpdatedEvent = TypedEvent<[string], RouterUpdatedEventObject>;

export type RouterUpdatedEventFilter = TypedEventFilter<RouterUpdatedEvent>;

export interface SignerUpdatedEventObject {
  newSigner: string;
}
export type SignerUpdatedEvent = TypedEvent<[string], SignerUpdatedEventObject>;

export type SignerUpdatedEventFilter = TypedEventFilter<SignerUpdatedEvent>;

export interface SplitterCreatedEventObject {
  creator: string;
  shares: BigNumber[];
  payees: string[];
  splitter: string;
  flag: BigNumber;
}
export type SplitterCreatedEvent = TypedEvent<
  [string, BigNumber[], string[], string, BigNumber],
  SplitterCreatedEventObject
>;

export type SplitterCreatedEventFilter = TypedEventFilter<SplitterCreatedEvent>;

export interface MADFactory721 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MADFactory721Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addColType(
      index: PromiseOrValue<BigNumberish>,
      impl: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    colInfo(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [string, number, string, BigNumber, string] & {
        creator: string;
        colType: number;
        colSalt: string;
        blocknumber: BigNumber;
        splitter: string;
      }
    >;

    colTypes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    createCollection(
      _tokenType: PromiseOrValue<BigNumberish>,
      _tokenSalt: PromiseOrValue<string>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      _price: PromiseOrValue<BigNumberish>,
      _maxSupply: PromiseOrValue<BigNumberish>,
      _baseURI: PromiseOrValue<string>,
      _splitter: PromiseOrValue<string>,
      _royalty: PromiseOrValue<BigNumberish>,
      _extra: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    creatorAuth(
      _token: PromiseOrValue<string>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean] & { stdout: boolean }>;

    creatorCheck(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string, boolean] & { creator: string; check: boolean }>;

    erc20(overrides?: CallOverrides): Promise<[string]>;

    getColID(
      _colAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string] & { colID: string }>;

    getDeployedAddr(
      _salt: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getIDsLength(
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    market(overrides?: CallOverrides): Promise<[string]>;

    name(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    router(overrides?: CallOverrides): Promise<[string]>;

    setMarket(
      _market: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setRouter(
      _router: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setSigner(
      _signer: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    signer(overrides?: CallOverrides): Promise<[string]>;

    splitterCheck(
      _splitterSalt: PromiseOrValue<string>,
      _ambassador: PromiseOrValue<string>,
      _project: PromiseOrValue<string>,
      _ambShare: PromiseOrValue<BigNumberish>,
      _projectShare: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    splitterInfo(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, string, BigNumber, BigNumber, boolean] & {
        splitter: string;
        splitterSalt: string;
        ambassador: string;
        project: string;
        ambShare: BigNumber;
        projectShare: BigNumber;
        valid: boolean;
      }
    >;

    typeChecker(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[number] & { pointer: number }>;

    userTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  addColType(
    index: PromiseOrValue<BigNumberish>,
    impl: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  colInfo(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [string, number, string, BigNumber, string] & {
      creator: string;
      colType: number;
      colSalt: string;
      blocknumber: BigNumber;
      splitter: string;
    }
  >;

  colTypes(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  createCollection(
    _tokenType: PromiseOrValue<BigNumberish>,
    _tokenSalt: PromiseOrValue<string>,
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    _price: PromiseOrValue<BigNumberish>,
    _maxSupply: PromiseOrValue<BigNumberish>,
    _baseURI: PromiseOrValue<string>,
    _splitter: PromiseOrValue<string>,
    _royalty: PromiseOrValue<BigNumberish>,
    _extra: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  creatorAuth(
    _token: PromiseOrValue<string>,
    _user: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  creatorCheck(
    _colID: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<[string, boolean] & { creator: string; check: boolean }>;

  erc20(overrides?: CallOverrides): Promise<string>;

  getColID(
    _colAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  getDeployedAddr(
    _salt: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  getIDsLength(
    _user: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  market(overrides?: CallOverrides): Promise<string>;

  name(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  router(overrides?: CallOverrides): Promise<string>;

  setMarket(
    _market: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOwner(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setRouter(
    _router: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setSigner(
    _signer: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  splitterCheck(
    _splitterSalt: PromiseOrValue<string>,
    _ambassador: PromiseOrValue<string>,
    _project: PromiseOrValue<string>,
    _ambShare: PromiseOrValue<BigNumberish>,
    _projectShare: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  splitterInfo(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string, string, BigNumber, BigNumber, boolean] & {
      splitter: string;
      splitterSalt: string;
      ambassador: string;
      project: string;
      ambShare: BigNumber;
      projectShare: BigNumber;
      valid: boolean;
    }
  >;

  typeChecker(
    _colID: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<number>;

  userTokens(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    addColType(
      index: PromiseOrValue<BigNumberish>,
      impl: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    colInfo(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [string, number, string, BigNumber, string] & {
        creator: string;
        colType: number;
        colSalt: string;
        blocknumber: BigNumber;
        splitter: string;
      }
    >;

    colTypes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    createCollection(
      _tokenType: PromiseOrValue<BigNumberish>,
      _tokenSalt: PromiseOrValue<string>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      _price: PromiseOrValue<BigNumberish>,
      _maxSupply: PromiseOrValue<BigNumberish>,
      _baseURI: PromiseOrValue<string>,
      _splitter: PromiseOrValue<string>,
      _royalty: PromiseOrValue<BigNumberish>,
      _extra: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<void>;

    creatorAuth(
      _token: PromiseOrValue<string>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    creatorCheck(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string, boolean] & { creator: string; check: boolean }>;

    erc20(overrides?: CallOverrides): Promise<string>;

    getColID(
      _colAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    getDeployedAddr(
      _salt: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    getIDsLength(
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    market(overrides?: CallOverrides): Promise<string>;

    name(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    router(overrides?: CallOverrides): Promise<string>;

    setMarket(
      _market: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setRouter(
      _router: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setSigner(
      _signer: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    signer(overrides?: CallOverrides): Promise<string>;

    splitterCheck(
      _splitterSalt: PromiseOrValue<string>,
      _ambassador: PromiseOrValue<string>,
      _project: PromiseOrValue<string>,
      _ambShare: PromiseOrValue<BigNumberish>,
      _projectShare: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    splitterInfo(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, string, BigNumber, BigNumber, boolean] & {
        splitter: string;
        splitterSalt: string;
        ambassador: string;
        project: string;
        ambShare: BigNumber;
        projectShare: BigNumber;
        valid: boolean;
      }
    >;

    typeChecker(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<number>;

    userTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "ColTypeUpdated(uint256)"(
      index?: PromiseOrValue<BigNumberish> | null
    ): ColTypeUpdatedEventFilter;
    ColTypeUpdated(
      index?: PromiseOrValue<BigNumberish> | null
    ): ColTypeUpdatedEventFilter;

    "ERC721BasicCreated(address,address,string,string,uint256,uint256,uint256)"(
      newSplitter?: PromiseOrValue<string> | null,
      newCollection?: PromiseOrValue<string> | null,
      name?: null,
      symbol?: null,
      royalties?: null,
      maxSupply?: null,
      mintPrice?: null
    ): ERC721BasicCreatedEventFilter;
    ERC721BasicCreated(
      newSplitter?: PromiseOrValue<string> | null,
      newCollection?: PromiseOrValue<string> | null,
      name?: null,
      symbol?: null,
      royalties?: null,
      maxSupply?: null,
      mintPrice?: null
    ): ERC721BasicCreatedEventFilter;

    "FeesUpdated(uint256,uint256)"(
      feeVal2?: null,
      feeVal3?: null
    ): FeesUpdatedEventFilter;
    FeesUpdated(feeVal2?: null, feeVal3?: null): FeesUpdatedEventFilter;

    "MarketplaceUpdated(address)"(
      newMarket?: PromiseOrValue<string> | null
    ): MarketplaceUpdatedEventFilter;
    MarketplaceUpdated(
      newMarket?: PromiseOrValue<string> | null
    ): MarketplaceUpdatedEventFilter;

    "OwnerUpdated(address,address)"(
      user?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnerUpdatedEventFilter;
    OwnerUpdated(
      user?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnerUpdatedEventFilter;

    "PaymentTokenUpdated(address)"(
      newPaymentToken?: PromiseOrValue<string> | null
    ): PaymentTokenUpdatedEventFilter;
    PaymentTokenUpdated(
      newPaymentToken?: PromiseOrValue<string> | null
    ): PaymentTokenUpdatedEventFilter;

    "RecipientUpdated(address)"(
      newRecipient?: PromiseOrValue<string> | null
    ): RecipientUpdatedEventFilter;
    RecipientUpdated(
      newRecipient?: PromiseOrValue<string> | null
    ): RecipientUpdatedEventFilter;

    "RouterUpdated(address)"(
      newRouter?: PromiseOrValue<string> | null
    ): RouterUpdatedEventFilter;
    RouterUpdated(
      newRouter?: PromiseOrValue<string> | null
    ): RouterUpdatedEventFilter;

    "SignerUpdated(address)"(
      newSigner?: PromiseOrValue<string> | null
    ): SignerUpdatedEventFilter;
    SignerUpdated(
      newSigner?: PromiseOrValue<string> | null
    ): SignerUpdatedEventFilter;

    "SplitterCreated(address,uint256[],address[],address,uint256)"(
      creator?: PromiseOrValue<string> | null,
      shares?: null,
      payees?: null,
      splitter?: null,
      flag?: null
    ): SplitterCreatedEventFilter;
    SplitterCreated(
      creator?: PromiseOrValue<string> | null,
      shares?: null,
      payees?: null,
      splitter?: null,
      flag?: null
    ): SplitterCreatedEventFilter;
  };

  estimateGas: {
    addColType(
      index: PromiseOrValue<BigNumberish>,
      impl: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    colInfo(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    colTypes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createCollection(
      _tokenType: PromiseOrValue<BigNumberish>,
      _tokenSalt: PromiseOrValue<string>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      _price: PromiseOrValue<BigNumberish>,
      _maxSupply: PromiseOrValue<BigNumberish>,
      _baseURI: PromiseOrValue<string>,
      _splitter: PromiseOrValue<string>,
      _royalty: PromiseOrValue<BigNumberish>,
      _extra: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    creatorAuth(
      _token: PromiseOrValue<string>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    creatorCheck(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    erc20(overrides?: CallOverrides): Promise<BigNumber>;

    getColID(
      _colAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDeployedAddr(
      _salt: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIDsLength(
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    market(overrides?: CallOverrides): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    router(overrides?: CallOverrides): Promise<BigNumber>;

    setMarket(
      _market: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setRouter(
      _router: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setSigner(
      _signer: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    signer(overrides?: CallOverrides): Promise<BigNumber>;

    splitterCheck(
      _splitterSalt: PromiseOrValue<string>,
      _ambassador: PromiseOrValue<string>,
      _project: PromiseOrValue<string>,
      _ambShare: PromiseOrValue<BigNumberish>,
      _projectShare: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    splitterInfo(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    typeChecker(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    userTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addColType(
      index: PromiseOrValue<BigNumberish>,
      impl: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    colInfo(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    colTypes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createCollection(
      _tokenType: PromiseOrValue<BigNumberish>,
      _tokenSalt: PromiseOrValue<string>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      _price: PromiseOrValue<BigNumberish>,
      _maxSupply: PromiseOrValue<BigNumberish>,
      _baseURI: PromiseOrValue<string>,
      _splitter: PromiseOrValue<string>,
      _royalty: PromiseOrValue<BigNumberish>,
      _extra: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    creatorAuth(
      _token: PromiseOrValue<string>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    creatorCheck(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    erc20(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getColID(
      _colAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDeployedAddr(
      _salt: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getIDsLength(
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    market(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setMarket(
      _market: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setRouter(
      _router: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setSigner(
      _signer: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    signer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    splitterCheck(
      _splitterSalt: PromiseOrValue<string>,
      _ambassador: PromiseOrValue<string>,
      _project: PromiseOrValue<string>,
      _ambShare: PromiseOrValue<BigNumberish>,
      _projectShare: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    splitterInfo(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    typeChecker(
      _colID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    userTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
