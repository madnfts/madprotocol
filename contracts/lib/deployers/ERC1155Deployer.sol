// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

import { SplitterImpl } from "../../Types.sol";

import { ERC1155Minimal } from "../tokens/ERC1155/Impl/ERC1155Minimal.sol";
import { ERC1155Basic } from "../tokens/ERC1155/Impl/ERC1155Basic.sol";
import { ERC1155Whitelist } from "../tokens/ERC1155/Impl/ERC1155Whitelist.sol";
import { ERC1155Lazy } from "../tokens/ERC1155/Impl/ERC1155Lazy.sol";

import { CREATE3 } from "../utils/CREATE3.sol";

library ERC1155MinimalDeployer {
    function _1155MinimalDeploy(
        string memory _tokenSalt,
        string memory _uri,
        uint256 _price,
        address _splitter,
        address _router,
        uint256 _royalty
    ) public returns (bytes32 tokenSalt, address deployed) {
        SplitterImpl splitter = SplitterImpl(
            payable(_splitter)
        );
        tokenSalt = keccak256(bytes(_tokenSalt));
        deployed = CREATE3.deploy(
            tokenSalt,
            abi.encodePacked(
                type(ERC1155Minimal).creationCode,
                abi.encode(
                    _uri,
                    _price,
                    splitter,
                    _royalty,
                    _router
                )
            ),
            0
        );
    }
}

library ERC1155BasicDeployer {
    function _1155BasicDeploy(
        string memory _tokenSalt,
        string memory _uri,
        uint256 _price,
        uint256 _maxSupply,
        address _splitter,
        address _router,
        uint256 _royalty
    ) public returns (bytes32 tokenSalt, address deployed) {
        SplitterImpl splitter = SplitterImpl(
            payable(_splitter)
        );
        tokenSalt = keccak256(bytes(_tokenSalt));
        deployed = CREATE3.deploy(
            tokenSalt,
            abi.encodePacked(
                type(ERC1155Basic).creationCode,
                abi.encode(
                    _uri,
                    _price,
                    _maxSupply,
                    splitter,
                    _royalty,
                    _router
                )
            ),
            0
        );
    }
}

library ERC1155WhitelistDeployer {
    function _1155WhitelistDeploy(
        string memory _tokenSalt,
        string memory _uri,
        uint256 _price,
        uint256 _maxSupply,
        address _splitter,
        address _router,
        uint256 _royalty
    ) public returns (bytes32 tokenSalt, address deployed) {
        SplitterImpl splitter = SplitterImpl(
            payable(_splitter)
        );
        tokenSalt = keccak256(bytes(_tokenSalt));
        deployed = CREATE3.deploy(
            tokenSalt,
            abi.encodePacked(
                type(ERC1155Whitelist).creationCode,
                abi.encode(
                    _uri,
                    _price,
                    _maxSupply,
                    splitter,
                    _royalty,
                    _router
                )
            ),
            0
        );
    }
}

library ERC1155LazyDeployer {
    function _1155LazyDeploy(
        string memory _tokenSalt,
        string memory _uri,
        address _splitter,
        address _router,
        address _signer,
        uint256 _royalty
    ) public returns (bytes32 tokenSalt, address deployed) {
        SplitterImpl splitter = SplitterImpl(
            payable(_splitter)
        );
        tokenSalt = keccak256(bytes(_tokenSalt));
        deployed = CREATE3.deploy(
            tokenSalt,
            abi.encodePacked(
                type(ERC1155Lazy).creationCode,
                abi.encode(
                    _uri,
                    splitter,
                    _royalty,
                    _router,
                    _signer
                )
            ),
            0
        );
    }
}
