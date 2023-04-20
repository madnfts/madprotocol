import os

repo_contract_path = "https://github.com/johnashu/madnfts-solidity-contracts/tree/main/"
fn = os.path.join("Slither", "results", "slither.results.json")
outFile = "Slither/results/slitherResults.MD"
impacts = ("High", "Medium", "Low", "Optimization")
omit_keys = ("elements", "markdown", "id", "first_markdown_element")
omit_checks = ()
omit_folders = ("test", "script")
stars = "*" * 80
IGNORED_DIR = "contracts/lib/test/"
