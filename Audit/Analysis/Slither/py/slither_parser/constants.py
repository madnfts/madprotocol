import os

REPO_CONTRACT_PATH = "https://github.com/johnashu/madnfts-solidity-contracts/tree/main/"
ROOT = os.path.join("Audit", "Analysis", "Slither")
FN = os.path.join(ROOT, "results", "slither.results.json")
OUTFILE = os.path.join(ROOT, "results", "slitherResults.MD")
IMPACTS = ("High", "Medium", "Low", "Optimization")
OMIT_KEYS = ("elements", "markdown", "id", "first_markdown_element")
OMIT_CHECKS = ()
OMIT_FOLDERS = ("test", "script")
IGNORED_DIR = os.path.join("contracts", "lib", "test")
ERC_GLOB = os.path.join(ROOT, "results", "erc-checker", "*.MD")
STARS = "*" * 80
EXCLUDED_DETECTORS = (
    "pragma",
    "solc-version",
    "assembly",
    "naming-convention",
    "uninitialized-state",
)
CONTRACTS_FOLDER = "contracts"
IGNORED_DIR = os.path.join("contracts", "lib", "test")
