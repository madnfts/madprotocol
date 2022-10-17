// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { SplitterImpl } from "../../Types.sol";

import { ERC721Minimal } from "../tokens/ERC721/Impl/ERC721Minimal.sol";
import { ERC721Basic } from "../tokens/ERC721/Impl/ERC721Basic.sol";
import { ERC721Whitelist } from "../tokens/ERC721/Impl/ERC721Whitelist.sol";
import { ERC721Lazy } from "../tokens/ERC721/Impl/ERC721Lazy.sol";

import { CREATE3 } from "../utils/CREATE3.sol";

library ERC721MinimalDeployer {
    function _721MinimalDeploy(
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
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
                type(ERC721Minimal).creationCode,
                abi.encode(
                    _name,
                    _symbol,
                    _tokenURI,
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

library ERC721BasicDeployer {
    function _721BasicDeploy(
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
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
                type(ERC721Basic).creationCode,
                abi.encode(
                    _name,
                    _symbol,
                    _baseURI,
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

library ERC721WhitelistDeployer {
    function _721WhitelistDeploy(
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
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
                type(ERC721Whitelist).creationCode,
                abi.encode(
                    _name,
                    _symbol,
                    _baseURI,
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

library ERC721LazyDeployer {
    function _721LazyDeploy(
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
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
                type(ERC721Lazy).creationCode,
                abi.encode(
                    _name,
                    _symbol,
                    _baseURI,
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
