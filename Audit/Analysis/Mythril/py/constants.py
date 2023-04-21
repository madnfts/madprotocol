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

timeouts = {"simple": 600, "medium": 1800, "large": 3600, "complex": 7200}

EXECUTION_TIMEOUT = timeouts["complex"]  # defaults 24 hours (secs)
SOLVER_TIMEOUT = 60000  #  defaults 25 seconds (milliseconds)
RECURSION_DEPTH = 1000
TX_COUNT = 100000
SOLC_JSON_PATH = "/tmp/solc.json"
OUT = "jsonv2"  # text, markdown, json, and jsonv2

WITH_DOCKER = "docker run -v $(pwd):/tmp mythril/"  # uses 'tmp' dir as a volume.  Leave as str() or '' if running local
