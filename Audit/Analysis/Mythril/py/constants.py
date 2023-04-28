import os

REPO_CONTRACT_PATH = "https://github.com/johnashu/madnfts-solidity-contracts/tree/main/"
ROOT = os.path.join("Audit", "Analysis", "Mythril")

FN = os.path.join(ROOT, "results", "Mythril.results.json")
OUTFILE = os.path.join(ROOT, "results", "MythrilResults.MD")
IMPACTS = ("High", "Medium", "Low", "Optimization")
OMIT_CHECKS = ()
OMIT_FOLDERS = ("test", "script")
ignored_dirs = (os.path.join("contracts", "lib", "test"),)
IGNORED_DIRS = tuple([str(x).replace("\\", "/") for x in ignored_dirs])
IGNORED_FILES = ("static_analysis.sol", "MAD.sol")
RUNS_SAVE_PATH = os.path.join(ROOT, "scripts", "runs")

STARS = "*" * 80
CONTRACTS_FOLDER = "contracts"

# Slither
OMIT_KEYS = ("elements", "markdown", "id", "first_markdown_element")
EXCLUDED_DETECTORS = "pragma", "solc-version", "assembly", "naming-convention"

# Mythril
docker_folder = "/tmp/"
timeouts = {"simple": 600, "medium": 1800, "large": 3600, "complex": 7200}
EXECUTION_TIMEOUT = timeouts["complex"]  # defaults 24 hours (secs)
SOLVER_TIMEOUT = 60_000  #  defaults 25 seconds (milliseconds)
RECURSION_DEPTH = 1000
TX_COUNT = 1_000
SOLC_JSON_PATH = f"{docker_folder}solc.json"
OUT = "jsonv2"  # text, markdown, json, and jsonv2
SOLC_REMAPPINGS_PATH = os.path.join(ROOT, "solc.json")
OUTPUT_FILE = "Mythril.json"
SOLVER_LOG = "solver.log"
WITH_DOCKER = ""  # "docker run -v $(pwd):/tmp mythril/"  # uses 'tmp' dir as a volume.  Leave as str() or '' if running local
STRATEGIES = ("delayed", "weighted-random")

# 0-1 where 0 = Fast and 1 is slower but more detalied
PRUNING_FACTOR = 1.0
LOG_LEVEL = 4

# log levels and their corresponding integer values:

# 0: CRITICAL
# 1: ERROR
# 2: WARNING
# 3: INFO (default)
# 4: DEBUG

# The --strategy option in Mythril allows you to choose the search strategy used during the symbolic execution of the smart contract. Each strategy has a different approach to explore the possible execution paths in the contract. Here's a description of each strategy:

# dfs (Depth-First Search): This strategy explores the execution paths in a depth-first manner. It goes as deep as possible along each branch before backtracking. This can be useful for finding issues that arise from a sequence of specific transactions or function calls.

# bfs (Breadth-First Search): This strategy explores the execution paths in a breadth-first manner. It visits all the nodes at the current depth level before moving on to the next level. This can be helpful for finding issues that may occur early in the contract execution, regardless of the order of function calls or transactions.

# naive-random: This strategy randomly selects the next state to explore. This can be useful for quickly finding issues that might not be easily discovered using more structured search strategies like DFS or BFS. However, the analysis might not be as thorough since it doesn't systematically explore all possible paths.

# weighted-random: This strategy also randomly selects the next state to explore but uses weights assigned to each state. The weights can be based on different factors, such as the number of constraints or the gas cost of the transaction. This strategy aims to find a balance between the thoroughness of systematic strategies and the speed of random strategies.

# delayed: This strategy starts with a DFS approach and then switches to a BFS approach after a specified delay. This can be useful for finding issues that may be discovered by either a depth-first or breadth-first search, providing a combination of both approaches.
