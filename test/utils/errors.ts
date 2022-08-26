export enum MinimalErrors {
  TransferFailed = "TRANSFER_FAILED",
  AlreadyMinted = "ALREADY_MINTED",
  PublicMintOff = "PUBLICMINT_OFF",
  Unauthorized = "UNAUTHORIZED",
  WrongPrice = "WRONG_PRICE",
  InvalidId = "INVALID_ID",
  NotMinted = "NOT_MINTED",
}

export enum BasicErrors {
  DecrementOverflow = "DECREMENT_OVERFLOW",
  PublicMintClosed = "PublicMintClosed",
  MaxSupplyReached = "MaxSupplyReached",
  TransferFailed = "TRANSFER_FAILED",
  Unauthorized = "UNAUTHORIZED",
  NotMintedYet = "NotMintedYet",
  Reentrancy = "REENTRANCY",
  WrongPrice = "WrongPrice",
  WrongFrom = "WRONG_FROM",
  NotMinted = "NOT_MINTED",
}

export enum WhitelistErrors {
  WhitelistMintClosed = "WhitelistMintClosed",
  MaxWhitelistReached = "MaxWhitelistReached",
  DecrementOverflow = "DECREMENT_OVERFLOW",
  PublicMintClosed = "PublicMintClosed",
  FreeClaimClosed = "FreeClaimClosed",
  TransferFailed = "TRANSFER_FAILED",
  MaxFreeReached = "MaxFreeReached",
  AlreadyClaimed = "AlreadyClaimed",
  MaxMintReached = "MaxMintReached",
  AddressDenied = "AddressDenied",
  Unauthorized = "UNAUTHORIZED",
  NotMintedYet = "NotMintedYet",
  WrongPrice = "WrongPrice",
  NotMinted = "NOT_MINTED",
  WrongFrom = "WRONG_FROM",
}

export enum LazyErrors {
  DecrementOverflow = "DECREMENT_OVERFLOW",
  InvalidSigner = "InvalidSigner",
  NotMintedYet = "NotMintedYet",
  Unauthorized = "UNAUTHORIZED",
  UsedVoucher = "UsedVoucher",
  WrongPrice = "WrongPrice",
  WrongFrom = "WRONG_FROM",
  NotMinted = "NOT_MINTED",
}

export enum SplitterErrors {
  LengthMismatch = "LENGTH_MISMATCH",
  DeniedAccount = "DENIED_ACCOUNT",
  AlreadyPayee = "ALREADY_PAYEE",
  InvalidShare = "INVALID_SHARE",
  DeadAddress = "DEAD_ADDRESS",
  NoPayees = "NO_PAYEES",
  NoShares = "NO_SHARES",
}

export enum MarketplaceErrors {
  TransferFailed = "TransferFailed",
  NotAuthorized = "NOT_AUTHORIZED",
  CanceledOrder = "CanceledOrder",
  InvalidBidder = "InvalidBidder",
  Unauthorized = "UNAUTHORIZED",
  ExceedsMaxEP = "ExceedsMaxEP",
  NeedMoreTime = "NeedMoreTime",
  AccessDenied = "AccessDenied",
  WrongPrice = "WrongPrice",
  NotBuyable = "NotBuyable",
  BidExists = "BidExists",
  SoldToken = "SoldToken",
  Timeout = "Timeout",
  EAOnly = "EAOnly",
  Paused = "PAUSED",
  Unpaused = "UNPAUSED",
  WrongFrom = "WRONG_FROM",
}

export enum FactoryErrors {
  DeploymentFailed = "DEPLOYMENT_FAILED",
  InitFailed = "INITIALIZATION_FAILED",
  Unauthorized = "UNAUTHORIZED",
  AccessDenied = "AccessDenied",
  SplitterFail = "SplitterFail",
  PushFailed = "PushFailed",
  ColFail = "ColFail",
  Paused = "PAUSED",
}

export enum RouterErrors {
  WithdrawFailed = "WITHDRAW_FAILED",
  Unauthorized = "UNAUTHORIZED",
  AccessDenied = "AccessDenied",
  InvalidType = "INVALID_TYPE",
  NoFunds = "NO_FUNDS",
  Paused = "PAUSED",
}
