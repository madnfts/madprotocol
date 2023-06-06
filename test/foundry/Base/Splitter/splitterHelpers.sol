// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

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
}
