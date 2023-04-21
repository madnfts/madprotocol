import os, json
from pathlib import Path
from typing import List


def find_unlisted_contracts(
    contracts_list: List[str], contracts_folder: str
) -> List[str]:

    IGNORED_DIR = os.path.join("contracts", "lib", "test")

    contracts_folder = Path(contracts_folder)
    unlisted_paths = []

    for file_path in contracts_folder.rglob("*.sol"):
        formatted_path = str(file_path).replace("\\", "/")

        if formatted_path.startswith(IGNORED_DIR):
            continue

        if formatted_path not in contracts_list:
            unlisted_paths.append(formatted_path)
    return unlisted_paths


def generate_remappings(folder: str) -> None:
    remappings = {"remappings": []}

    for i in find_unlisted_contracts([], folder):
        path_only = ''.join(i.split('/')[:-1])
        new = f"{path_only}=/tmp/{path_only}"
        if new not in remappings["remappings"]:
            remappings["remappings"].append(new)

    with open(os.path.join("Mythril","solc.json"), "w") as outfile:
        json.dump(remappings, outfile)


def generate_script(folder: str) -> None:
    scripts = []

    for i in find_unlisted_contracts([], folder):
        if i not in scripts:
           scripts.append(f"docker run -v $(pwd):/tmp mythril/myth analyze /tmp/{i} -t 1 --solc-json /tmp/solc.json -o json")

    with open(os.path.join("Mythril", "scripts", "runs"), "w") as file:
        for x in scripts:
            file.write(f'{x}\n')


if __name__ == "__main__":
    generate_remappings("contracts")
    generate_script("contracts")
