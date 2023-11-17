/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  MarketplaceEventsAndErrorsBase,
  MarketplaceEventsAndErrorsBaseInterface,
} from "../../../Shared/EventsAndErrors.sol/MarketplaceEventsAndErrorsBase";
import { Contract, Interface, type ContractRunner } from "ethers";

const _abi = [
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "BidExists",
    type: "error",
  },
  {
    inputs: [],
    name: "CanceledOrder",
    type: "error",
  },
  {
    inputs: [],
    name: "EAOnly",
    type: "error",
  },
  {
    inputs: [],
    name: "ExceedsMaxEP",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidBidder",
    type: "error",
  },
  {
    inputs: [],
    name: "NeedMoreTime",
    type: "error",
  },
  {
    inputs: [],
    name: "NotBuyable",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOwnerNorApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "SoldToken",
    type: "error",
  },
  {
    inputs: [],
    name: "Timeout",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongPrice",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "newMinDuration",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "newIncrement",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newMinBidValue",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "newMaxDuration",
        type: "uint256",
      },
    ],
    name: "AuctionSettingsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract FactoryVerifier",
        name: "newFactory",
        type: "address",
      },
    ],
    name: "FactoryUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "feeVal2",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeVal3",
        type: "uint256",
      },
    ],
    name: "FeesUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newPaymentToken",
        type: "address",
      },
    ],
    name: "PaymentTokenUpdated",
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
    name: "RecipientUpdated",
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
        indexed: false,
        internalType: "address",
        name: "erc20",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "UserOutbid",
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
        indexed: false,
        internalType: "address",
        name: "erc20",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawOutbid",
    type: "event",
  },
] as const;

export class MarketplaceEventsAndErrorsBase__factory {
  static readonly abi = _abi;
  static createInterface(): MarketplaceEventsAndErrorsBaseInterface {
    return new Interface(_abi) as MarketplaceEventsAndErrorsBaseInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): MarketplaceEventsAndErrorsBase {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as MarketplaceEventsAndErrorsBase;
  }
}