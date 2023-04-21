import os

REPO_CONTRACT_PATH = "https://github.com/johnashu/madnfts-solidity-contracts/tree/main/"
ROOT = os.path.join("Audit", "Analysis", "Mythril")

FN = os.path.join(ROOT, "results", "Mythril.results.json")
OUTFILE = os.path.join(ROOT, "results", "MythrilResults.MD")
IMPACTS = ("High", "Medium", "Low", "Optimization")
OMIT_KEYS = ("elements", "markdown", "id", "first_markdown_element")
OMIT_CHECKS = ()
OMIT_FOLDERS = ("test", "script")
IGNORED_DIR = os.path.join("contracts", "lib", "test")
STARS = "*" * 80
EXCLUDED_DETECTORS = "pragma", "solc-version", "assembly", "naming-convention"
CONTRACTS_FOLDER = "contracts"
SOLC_REMAPPINGS_PATH = os.path.join(ROOT, "solc.json")
RUNS_SAVE_PATH = os.path.join(ROOT, "scripts", "runs")

timeouts = {
    'simple': 600,
    'medium': 1800,
    'large': 3600,
    'complex': 7200
}

EXECUTION_TIMEOUT = timeouts['simple']   # defaults 24 hours (secs)
SOLVER_TIMEOUT = 60000  #  defaults 25 seconds (milliseconds)
RECURSION_DEPTH = 100
SOLC_JSON_PATH = "/tmp/solc.json"
TX_COUNT = 10000
OUT = "jsonv2"  # text, markdown, json, and jsonv2


# For simple contracts or a quick analysis, you can set the execution timeout to 10 minutes (600 seconds).
# For medium-sized contracts or a more in-depth analysis, consider setting the execution timeout to 30 minutes (1800 seconds).
# For larger, more complex contracts or a comprehensive analysis, you might set the execution timeout to 1-2 hours (3600-7200 seconds).

