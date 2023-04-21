import json
import sys
import os
from slither.__main__ import main
from slither.utils.output import Output


def run(contract_directory, config_file_path):
    # Load Slither configuration from JSON file
    with open(config_file_path, "r") as config_file:
        config_json = json.load(config_file)

    # Get the output directory from the config file
    output_directory = config_json.get("json", "")

    # Walk through the directory structure and analyze all contracts
    for root, _, files in os.walk(contract_directory):
        for file in files:
            if file.endswith(".sol"):
                contract_path = os.path.join(root, file)
                analyze_contract(contract_path, config_json, output_directory)


def analyze_contract(contract_path, config_json, output_directory):
    main
    # Initialize Slither
    slither = Slither(contract_path, **config_json)

    # Run Slither analysis
    slither.run_detectors()

    # Collect and print the results
    print(
        f"\nSlither analysis results for {contract_path}\njson saved at: {output_directory}:"
    )

    for detector in slither.detectors:
        print(detector)
        for issue in detector.issues:
            issue_data = Output(issue).data
            print_issue(issue_data)

            # Save JSON data to a file
            save_json_data(issue_data, contract_path, output_directory)


def print_issue(issue_data):
    print(json.dumps(issue_data, indent=2))


def save_json_data(issue_data, contract_path, output_directory):
    output_file_name = (
        f"{os.path.splitext(os.path.basename(contract_path))[0]}_issues.json"
    )

    if not output_directory:
        output_directory = os.path.dirname(contract_path)
    elif not os.path.exists(output_directory):
        os.makedirs(output_directory)

    json_output_file = os.path.join(output_directory, output_file_name)

    with open(json_output_file, "a") as f:
        json.dump(issue_data, f, indent=2)
        # f.write('\n')


if __name__ == "__main__":
    contract_directory = "contracts/"

    config_file_path = "Slither/slither.config.json"

    try:
        run(contract_directory, config_file_path)
    except Exception as e:
        print("Error running slither-analyzer:", file=sys.stderr)
        print(str(e), file=sys.stderr)
