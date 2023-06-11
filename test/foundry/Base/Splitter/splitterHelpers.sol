// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";

library SplitterHelpers {
    // address[] payeesExpected_onlyCreator = [currentSigner];
    // address[] payeesExpected_ambassadorWithNoProject = [ambassador,
    // currentSigner];
    // address[] payeesExpected_projectWithNoAmbassador = [project,
    // currentSigner];
    // address[] payeesExpected_All = [ambassador, project, currentSigner];

    function getExpectedSplitterAddresses(
        address currentSigner,
        address ambassador,
        address project
    ) internal pure returns (address[] memory) {
        address[] memory addresses = new address[](3);
        uint256 count = 0;

        // Add non-zero addresses to the array
        if (ambassador != address(0)) {
            addresses[count] = ambassador;
            count++;
        }

        if (project != address(0)) {
            addresses[count] = project;
            count++;
        }

        if (currentSigner != address(0)) {
            addresses[count] = currentSigner;
            count++;
        }

        // Resize the array to remove any unused elements
        assembly {
            mstore(addresses, count)
        }

        return addresses;
    }

    function allSplitterCombinations(
        address factory,
        uint256 _ambassadorShare,
        uint256 _projectShare
    )
        external
        pure
        returns (
            bytes4[4] memory functionSignatures,
            bytes[4] memory functionArgs
        )
    {
        return (
            [
                bytes4(0xe559eca2), //  =>  _runSplitterDeploy_creatorOnly(address)
                bytes4(0x3d9f677f), //  =>  _runSplitterDeploy_ambassadorWithNoProject(address,uint256)
                bytes4(0x61594b53), //  =>  _runSplitterDeploy_projectWithNoAmbassador(address,uint256)
                bytes4(0x480297ed) //   =>  _runSplitterDeploy_BothAmbassadorAndProject(address,uint256,uint256)
            ],
            [
                abi.encode(factory),
                abi.encode(factory, _ambassadorShare),
                abi.encode(factory, _projectShare),
                abi.encode(factory, _ambassadorShare, _projectShare)
            ]
        );
    }

    function callFunctionAndGetSplitter(
        address splitterDeployer,
        bytes4 functionSignature,
        bytes calldata functionArgs
    ) external returns (address splitter) {
        bool success;
        bytes memory _splitter;

        bytes memory data = abi.encodeWithSelector(functionSignature);
        data = abi.encodePacked(data, functionArgs);

        (success, _splitter) = splitterDeployer.call(data);

        require(success, "Function call failed");

        assembly {
            splitter := mload(add(_splitter, 0x20))
        }
    }
}
