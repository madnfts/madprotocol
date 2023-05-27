export enum MinimalErrors {
  TransferFailed = "TRANSFER_FAILED",
  AlreadyMinted = "AlreadyMinted",
  PublicMintOff = "PublicMintOff",
  Unauthorized = "UNAUTHORIZED",
  WrongPrice = "WrongPrice",
  InvalidId = "InvalidId",
  NotMinted = "NOT_MINTED",
  NotMintedBytes4 = "NotMinted",
  InvalidAmount = "INVALID_AMOUNT",
}

export enum BasicErrors {
  TransferFromIncorrectOwner = "TransferFromIncorrectOwner",
  DecrementOverflow = "DecOverflow",
  PublicMintClosed = "PublicMintClosed",
  MaxSupplyReached = "MaxSupplyReached",
  TransferFailed = "TRANSFER_FAILED",
  Unauthorized = "UNAUTHORIZED",
  NotMintedYet = "NotMintedYet",
  Reentrancy = "REENTRANCY",
  WrongPrice = "WrongPrice",
  InsufficientBalance = "InsufficientBalance",
  NotMinted = "NOT_MINTED",
  InvalidAmount = "INVALID_AMOUNT",
  NotAuthorised = "NotAuthorised",
  ArrayLengthsMismatch = "ArrayLengthsMismatch",
}

export enum WhitelistErrors {
  WhitelistMintClosed = "WhitelistMintClosed",
  MaxWhitelistReached = "MaxWhitelistReached",
  DecrementOverflow = "DecOverflow",
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
  InsufficientBalance = "InsufficientBalance",
  InvalidAmount = "INVALID_AMOUNT",
}

export enum LazyErrors {
  DecrementOverflow = "DecOverflow",
  InvalidSigner = "InvalidSigner",
  NotMintedYet = "NotMintedYet",
  Unauthorized = "UNAUTHORIZED",
  UsedVoucher = "UsedVoucher",
  WrongPrice = "WrongPrice",
  InsufficientBalance = "InsufficientBalance",
  NotMinted = "NOT_MINTED",
  InvalidAmount = "INVALID_AMOUNT",
}

export enum SplitterErrors {
  LengthMismatch = "LengthMismatch",
  DeniedAccount = "DeniedAccount",
  AlreadyPayee = "AlreadyPayee",
  InvalidShare = "InvalidShare",
  DeadAddress = "DeadAddress",
  NoPayees = "NoPayees",
  NoShares = "NoShares",
}

export enum MarketplaceErrors {
  TransferFailed = "TransferFailed",
  NotOwnerNorApproved = "NotOwnerNorApproved",
  CanceledOrder = "CanceledOrder",
  InvalidBidder = "InvalidBidder",
  Unauthorized = "UNAUTHORIZED",
  ExceedsMaxEP = "ExceedsMaxEP",
  AccessDenied = "AccessDenied",
  NeedMoreTime = "NeedMoreTime",
  WrongPrice = "WrongPrice",
  NotBuyable = "NotBuyable",
  InsufficientBalance = "InsufficientBalance",
  SoldToken = "SoldToken",
  BidExists = "BidExists",
  Unpaused = "UNPAUSED",
  Timeout = "Timeout",
  Paused = "PAUSED",
  EAOnly = "EAOnly",
  ZeroAddress = "ZeroAddress",
  NoBalanceToWithdraw = "No balance to withdraw",
}

export enum FactoryErrors {
  DeploymentFailed = "DEPLOYMENT_FAILED",
  InitFailed = "INITIALIZATION_FAILED",
  InvalidAddress = "InvalidAddress",
  Unauthorized = "UNAUTHORIZED",
  AccessDenied = "AccessDenied",
  SplitterFail = "SplitterFail",
  PushFailed = "PushFailed",
  ColFail = "ColFail",
  Paused = "PAUSED",
}

export enum RouterErrors {
  AlreadyMinted = "AlreadyMinted",
  WithdrawFailed = "WITHDRAW_FAILED",
  Unauthorized = "UNAUTHORIZED",
  AccessDenied = "AccessDenied",
  InvalidType = "INVALID_TYPE",
  InvalidTypeBytes4 = "InvalidType",
  NoFunds = "NO_FUNDS",
  Paused = "PAUSED",
  URILocked = "URILocked",
}
