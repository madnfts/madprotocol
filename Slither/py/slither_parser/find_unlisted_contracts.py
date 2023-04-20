import pathlib

IGNORED_DIR = "contracts/lib/test/"


def find_unlisted_contracts(contracts_list: list, contracts_folder: str):
    contracts_folder = pathlib.Path(contracts_folder)
    unlisted_paths = []

    for file_path in contracts_folder.rglob("*.sol"):
        formatted_path = str(file_path).replace("\\", "/")

        if formatted_path.startswith(IGNORED_DIR):
            continue

        if formatted_path not in contracts_list:
            unlisted_paths.append(formatted_path)

    return unlisted_paths
