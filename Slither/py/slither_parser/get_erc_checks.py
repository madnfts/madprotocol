import glob


def get_erc_checks() -> str:
    check_str = ""
    for check in glob.glob("Slither/results/erc-checker/*.MD"):
        with open(check, "r") as f:
            check_str += f"\n{f.read()}"
    return check_str
