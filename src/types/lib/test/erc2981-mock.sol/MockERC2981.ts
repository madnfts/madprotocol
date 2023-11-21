/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";

export interface MockERC2981Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "_royaltyFee"
      | "_royaltyRecipient"
      | "owner"
      | "royaltyInfo"
      | "setOwner"
      | "setRoyaltyRecipient"
      | "supportsInterface"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnerUpdated"
      | "RoyaltyFeeSet"
      | "RoyaltyRecipientSet"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_royaltyFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_royaltyRecipient",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "royaltyInfo",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setRoyaltyRecipient",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "_royaltyFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_royaltyRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "royaltyInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setRoyaltyRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
}

export namespace OwnerUpdatedEvent {
  export type InputTuple = [user: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [user: string, newOwner: string];
  export interface OutputObject {
    user: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoyaltyFeeSetEvent {
  export type InputTuple = [newRoyaltyFee: BigNumberish];
  export type OutputTuple = [newRoyaltyFee: bigint];
  export interface OutputObject {
    newRoyaltyFee: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoyaltyRecipientSetEvent {
  export type InputTuple = [newRecipient: AddressLike];
  export type OutputTuple = [newRecipient: string];
  export interface OutputObject {
    newRecipient: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface MockERC2981 extends BaseContract {
  connect(runner?: ContractRunner | null): MockERC2981;
  waitForDeployment(): Promise<this>;

  interface: MockERC2981Interface;

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

  _royaltyFee: TypedContractMethod<[], [bigint], "view">;

  _royaltyRecipient: TypedContractMethod<[], [string], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  royaltyInfo: TypedContractMethod<
    [arg0: BigNumberish, salePrice: BigNumberish],
    [[string, bigint] & { receiver: string; royaltyAmount: bigint }],
    "view"
  >;

  setOwner: TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  setRoyaltyRecipient: TypedContractMethod<
    [recipient: AddressLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_royaltyFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "_royaltyRecipient"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "royaltyInfo"
  ): TypedContractMethod<
    [arg0: BigNumberish, salePrice: BigNumberish],
    [[string, bigint] & { receiver: string; royaltyAmount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "setOwner"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setRoyaltyRecipient"
  ): TypedContractMethod<[recipient: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;

  getEvent(
    key: "OwnerUpdated"
  ): TypedContractEvent<
    OwnerUpdatedEvent.InputTuple,
    OwnerUpdatedEvent.OutputTuple,
    OwnerUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "RoyaltyFeeSet"
  ): TypedContractEvent<
    RoyaltyFeeSetEvent.InputTuple,
    RoyaltyFeeSetEvent.OutputTuple,
    RoyaltyFeeSetEvent.OutputObject
  >;
  getEvent(
    key: "RoyaltyRecipientSet"
  ): TypedContractEvent<
    RoyaltyRecipientSetEvent.InputTuple,
    RoyaltyRecipientSetEvent.OutputTuple,
    RoyaltyRecipientSetEvent.OutputObject
  >;

  filters: {
    "OwnerUpdated(address,address)": TypedContractEvent<
      OwnerUpdatedEvent.InputTuple,
      OwnerUpdatedEvent.OutputTuple,
      OwnerUpdatedEvent.OutputObject
    >;
    OwnerUpdated: TypedContractEvent<
      OwnerUpdatedEvent.InputTuple,
      OwnerUpdatedEvent.OutputTuple,
      OwnerUpdatedEvent.OutputObject
    >;

    "RoyaltyFeeSet(uint256)": TypedContractEvent<
      RoyaltyFeeSetEvent.InputTuple,
      RoyaltyFeeSetEvent.OutputTuple,
      RoyaltyFeeSetEvent.OutputObject
    >;
    RoyaltyFeeSet: TypedContractEvent<
      RoyaltyFeeSetEvent.InputTuple,
      RoyaltyFeeSetEvent.OutputTuple,
      RoyaltyFeeSetEvent.OutputObject
    >;

    "RoyaltyRecipientSet(address)": TypedContractEvent<
      RoyaltyRecipientSetEvent.InputTuple,
      RoyaltyRecipientSetEvent.OutputTuple,
      RoyaltyRecipientSetEvent.OutputObject
    >;
    RoyaltyRecipientSet: TypedContractEvent<
      RoyaltyRecipientSetEvent.InputTuple,
      RoyaltyRecipientSetEvent.OutputTuple,
      RoyaltyRecipientSetEvent.OutputObject
    >;
  };
}
