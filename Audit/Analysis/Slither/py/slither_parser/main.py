import json
import os
import glob
import pathlib
from typing import Dict, List, Tuple
from templates import base_template, check_template, checks_header, issues_found
from constants import (
    REPO_CONTRACT_PATH,
    FN,
    OUTFILE,
    IMPACTS,
    OMIT_KEYS,
    OMIT_CHECKS,
    OMIT_FOLDERS,
    STARS,
    IGNORED_DIR,
    ERC_GLOB,
    EXCLUDED_DETECTORS,
)


def find_unlisted_contracts(
    contracts_list: List[str], contracts_folder: str, fileType: str = "*.sol"
) -> List[str]:

    contracts_folder = pathlib.Path(contracts_folder)
    unlisted_paths = []

    for file_path in contracts_folder.rglob(fileType):
        formatted_path = str(file_path)
        if formatted_path.startswith(IGNORED_DIR):
            continue

        if formatted_path not in contracts_list:
            unlisted_paths.append(formatted_path)
    return unlisted_paths


def get_erc_checks() -> str:
    check_str = ""
    for check in glob.glob(ERC_GLOB):
        with open(check, "r") as f:
            check_str += f"\n{f.read()}"
    return check_str


def parse_results(results) -> Tuple[Dict[str, List[str]], Dict[str, int], List[str]]:
    markdown_data = {}
    items_count = {"High": 0, "Medium": 0, "Low": 0, "Optimization": 0}
    contracts = []

    for check in results:
        contract_name = check["first_markdown_element"].split("#")[0]
        if contract_name not in contracts:
            contracts.append(contract_name)
        if (
            check.get("impact") in IMPACTS
            and not check["elements"][0]["source_mapping"][
                "filename_relative"
            ].startswith(OMIT_FOLDERS)
            and check["check"] not in OMIT_CHECKS
        ):
            items_count[check["impact"]] += 1

            try:
                markdown_data[check["check"]].append(
                    check_template.format(
                        check["impact"],
                        check["confidence"],
                        check["first_markdown_element"].split("#")[-1],
                        check["markdown"].replace(
                            "contracts/", f"{REPO_CONTRACT_PATH}contracts/"
                        ),
                    )
                )
            except KeyError:
                markdown_data[check["check"]] = [
                    check_template.format(
                        check["impact"],
                        check["confidence"],
                        check["first_markdown_element"].split("#")[-1],
                        check["markdown"].replace(
                            "contracts/", f"{REPO_CONTRACT_PATH}contracts/"
                        ),
                    )
                ]

            print(
                f"{STARS}\n\n>>> {check['elements'][0]['source_mapping']['filename_relative']}\n"
            )

            for k, v in check.items():
                if k not in OMIT_KEYS:
                    print(f"{k}\n\t{v}\n")

    return markdown_data, items_count, contracts


def generate_header(items_count: Dict[str, int], contracts: List[str]) -> str:
    nl = "\n\n"
    header = (
        "# Slither Results\n\n"
        + issues_found.format(
            items_count["High"],
            items_count["Medium"],
            items_count["Low"],
            items_count["Optimization"],
        )
        + f"\n\n# Excluded Detectors\n \n {''.join([f'- *{x}*{nl}' for x in EXCLUDED_DETECTORS])}"
        + "\n## Smart Contracts Analysed With Issues: \n"
        + "".join([f"- [{x}]({REPO_CONTRACT_PATH}{x})\n" for x in contracts])
        + "\n## Smart Contracts Analysed With NO Issues: \n"
        + "".join(
            [
                f"- [{x}]({REPO_CONTRACT_PATH}{x})\n"
                for x in find_unlisted_contracts(contracts, "contracts")
            ]
        )
        + "\n\n"
    )
    return header


def write_output(header: str, markdown_data: Dict[str, List[str]]) -> None:
    with open(OUTFILE, "w") as f:
        f.write(header)
        for checkType, items in markdown_data.items():
            summary = f"\n\n# {checkType}\n\n> Items Found: {len(items)}\n"
            for i, item in enumerate(items):
                summary += f"\n_Item {i+1} / {len(items)}_\n{item}"
            f.write(summary)
        f.write(checks_header + get_erc_checks())


def delete_file(file_path: str) -> None:
    try:
        os.remove(file_path)
        print(f"File '{file_path}' has been deleted.")
    except FileNotFoundError:
        print(f"File '{file_path}' not found.")
    except Exception as e:
        print(f"Error while deleting the file '{file_path}': {e}")


def generate_import_file(folder: str) -> None:
    toml_template = "'{}' = ['{}'],\n"
    toml_str = "contracts = {"
    gen = "// SPDX-License-Identifier: AGPL-3.0-only\n\npragma solidity 0.8.19;\n\n"

    for i in find_unlisted_contracts([], folder):
        contract_name = i.split("\\")[-1][:-4]
        toml_str += toml_template.format(i, contract_name)
        # print(sections)
        print(i)
        gen += f'import {{{contract_name}}} from "{i}";\n'

    gen += "\ncontract StaticAnalysis {}\n"

    toml_str += "}"

    print(toml_str)

    with open(os.path.join(folder, "static_analysis.sol"), "w") as file:
        file.write(gen)


def get_test_files_paths(
    folder: str, template: str, fileType: str = "*.t.sol"
) -> List[str]:
    test_folder = pathlib.Path(folder)
    files = []
    for file_path in test_folder.rglob(fileType):
        formatted_path = template.format(str(file_path))
        files.append(formatted_path)
        print(formatted_path)

    return files


def main() -> None:
    with open(FN) as f:
        results = json.load(f)["results"]["detectors"]

    markdown_data, items_count, contracts = parse_results(results)
    header = generate_header(items_count, contracts)
    write_output(header, markdown_data)


if __name__ == "__main__":
    # main()
    # generate_import_file("contracts")
    # delete_file("Audit/Analysis/Slither/results/slither.results.json")
    # get_test_files_paths('test', 'npx hardhat test {}', fileType='*.test.ts' )
    get_test_files_paths("test/foundry/", "forge test --match-path {}")
