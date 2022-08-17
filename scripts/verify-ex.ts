// import "@nomiclabs/hardhat-ethers";
// import "@nomiclabs/hardhat-etherscan";
// import { ethers } from "hardhat";

// const hre = require("hardhat");

// // No need to generate any newer typings.
// // Deploying contracts with 0xdBDF6b7315f080480fCd6E6Bbd630CB6354301Ff
// // ERC721 Marketplace address: 0x06c148aC2038382d834A32E774cdC834C00EFb9c
// // ERC721 Factory address: 0xf340c073b64f5e400942d0cF65C98c20847e7956
// // ERC721 Router address: 0x7D93dB2D36129b5976473028E0ee03D84Ce511F6
// // Auth transfers executed.

// const a = "0x06c148aC2038382d834A32E774cdC834C00EFb9c";
// const b = "0xf340c073b64f5e400942d0cF65C98c20847e7956";

// const c = "0x7D93dB2D36129b5976473028E0ee03D84Ce511F6";

// const main = async () => {
//   await hre.run("verify:verify", {
//     address: a,
//     constructorArguments: [
//       a,
//       300,
//       ethers.constants.AddressZero,
//     ],
//   });
//   await hre.run("verify:verify", {
//     address: b,
//     constructorArguments: [a, ethers.constants.AddressZero],
//   });
//   await hre.run("verify:verify", {
//     address: c,
//     constructorArguments: b,
//   });
// };

// main()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.log(error);
//     process.exit(1);
//   });
