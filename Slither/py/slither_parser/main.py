import json
import os
from templates import base_template, check_template, checks_header, issues_found
from find_unlisted_contracts import find_unlisted_contracts
from get_erc_checks import get_erc_checks
from constants import (
    repo_contract_path,
    fn,
    outFile,
    impacts,
    omit_keys,
    omit_checks,
    omit_folders,
    stars,
)


def parse_results(results):
    markdown_data = {}
    items_count = {"High": 0, "Medium": 0, "Low": 0, "Optimization": 0}
    contracts = []

    for check in results:
        contract_name = check["first_markdown_element"].split("#")[0]
        if contract_name not in contracts:
            contracts.append(contract_name)
        if (
            check.get("impact") in impacts
            and not check["elements"][0]["source_mapping"][
                "filename_relative"
            ].startswith(omit_folders)
            and check["check"] not in omit_checks
        ):
            items_count[check["impact"]] += 1

            try:
                markdown_data[check["check"]].append(
                    check_template.format(
                        check["impact"],
                        check["confidence"],
                        check["first_markdown_element"].split("#")[-1],
                        check["markdown"].replace(
                            "contracts/", f"{repo_contract_path}contracts/"
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
                            "contracts/", f"{repo_contract_path}contracts/"
                        ),
                    )
                ]

            print(
                f"{stars}\n\n>>> {check['elements'][0]['source_mapping']['filename_relative']}\n"
            )

            for k, v in check.items():
                if k not in omit_keys:
                    print(f"{k}\n\t{v}\n")

    return markdown_data, items_count, contracts


def generate_header(items_count, contracts):
    header = (
        "# Slither Results\n\n"
        + issues_found.format(
            items_count["High"],
            items_count["Medium"],
            items_count["Low"],
            items_count["Optimization"],
        )
        + "\n## Smart Contracts Analysed With Issues: \n"
        + "".join([f"- [{x}]({repo_contract_path}{x})\n" for x in contracts])
        + "\n## Smart Contracts Analysed With NO Issues: \n"
        + "".join(
            [
                f"- [{x}]({repo_contract_path}{x})\n"
                for x in find_unlisted_contracts(contracts, "contracts")
            ]
        )
        + "\n\n"
    )
    return header


def write_output(header, markdown_data):
    done = []
    with open(outFile, "w") as f:
        f.write(header)
        for checkType, items in markdown_data.items():
            # impact = items
            # print(impact)
            # if impact not in done:
            #     f.write(f"\n\n# {impact} Items\n\n ---")
            #     done.append(impact)
            summary = f"\n\n# {checkType}\n\n> Items Found: {len(items)}\n"
            for i, item in enumerate(items):
                summary += f"\n_Item {i+1} / {len(items)}_\n{item}"
            f.write(summary)
        f.write(checks_header + get_erc_checks())


def main():
    with open(fn) as f:
        results = json.load(f)["results"]["detectors"]

    markdown_data, items_count, contracts = parse_results(results)
    header = generate_header(items_count, contracts)
    write_output(header, markdown_data)


if __name__ == "__main__":
    main()
