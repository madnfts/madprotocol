/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";

export interface FactoryVerifierInterface extends Interface {
  getFunction(
    nameOrSignature: "creatorAuth" | "creatorCheck"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "creatorAuth",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "creatorCheck",
    values: [AddressLike, AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "creatorAuth",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "creatorCheck",
    data: BytesLike
  ): Result;
}

export interface FactoryVerifier extends BaseContract {
  connect(runner?: ContractRunner | null): FactoryVerifier;
  waitForDeployment(): Promise<this>;

  interface: FactoryVerifierInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  creatorAuth: TypedContractMethod<
    [_token: AddressLike, _user: AddressLike],
    [boolean],
    "view"
  >;

  creatorCheck: TypedContractMethod<
    [_collectionId: AddressLike, _creator: AddressLike],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "creatorAuth"
  ): TypedContractMethod<
    [_token: AddressLike, _user: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "creatorCheck"
  ): TypedContractMethod<
    [_collectionId: AddressLike, _creator: AddressLike],
    [boolean],
    "view"
  >;

  filters: {};
}