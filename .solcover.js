const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov"],
  providerOptions: {
    mnemonic: process.env.MNEMONIC,
  },
  skipFiles: [
    "test",
    "contracts/lib/test",
    "MADFactory1155.sol",
    "MADFactory721.sol",
  ],
};
