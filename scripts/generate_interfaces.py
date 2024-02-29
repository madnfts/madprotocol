import json
import os


class Abi2Interface:
    solidity_version = "0.8.22"

    def get_in_or_out(self, inputs):
        return ", ".join(
            [
                f"{i['type']} memory {i.get('name', '')}".strip()
                if i["type"] in ["string", "bytes"] or i["type"].endswith("[]")
                else f"{i['type']} {i.get('name', '')}".strip()
                for i in inputs
            ]
        )

    def get_method_interface(self, method):
        if method["type"] != "function":
            return None

        state_mutability = method.get("stateMutability")

        if state_mutability not in ["pure", "view"]:
            state_mutability = ""

        payable = "payable" if method.get("payable") else ""

        output = self.get_in_or_out(method.get("outputs", []))
        output = f"returns ({output})" if output else ""

        return_string = f"{method['type']} {method.get('name', '')}({self.get_in_or_out(method.get('inputs', []))}) external {state_mutability} {payable} {output}".strip()
        return return_string

    def abi2solidity(self, abi, interface_name):
        function_categories = {"pure": [], "view": [], "payable": [], "other": []}

        create_file = False

        for method in abi:
            method_string = self.get_method_interface(method)
            if method_string:
                create_file = True
                if "pure" in method_string:
                    function_categories["pure"].append(f"\t{method_string};")
                elif "view" in method_string:
                    function_categories["view"].append(f"\t{method_string};")
                elif "payable" in method_string:
                    function_categories["payable"].append(f"\t{method_string};")
                else:
                    function_categories["other"].append(f"\t{method_string};")
        
        out = f"// SPDX-License-Identifier: UNLICENSED\npragma solidity {self.solidity_version};\n\ninterface {interface_name}\n{{\n"
        n = "\n"
        out += "\n".join(
            f"\t// {category.capitalize()} Functions\n{n.join(functions)}\n\n"
            for category, functions in function_categories.items()
            if functions
        )

        return out + "}\n" if create_file else ""

    def abi2solidity_files(self, input_file, output_file, interface_name):
        ignore = False
        with open(input_file, "r") as abi_file:
            file_json = json.load(abi_file)
            if "abi" in file_json:  # Ensure there is an 'abi' key in the JSON
                if "ast" in file_json:
                    if file_json['ast']['absolutePath'] in IGNORE_PATHS:   
                        ignore = True  
                if not ignore:
                    solidity = self.abi2solidity(file_json["abi"], interface_name)
                    if solidity:
                        with open(output_file, "w") as solidity_file:
                            solidity_file.write(solidity)

    def convert_abis_in_directory(self, input_directory, output_directory):
        os.makedirs(
            output_directory, exist_ok=True
        )  # Create output directory if it doesn't exist
        for root, _, files in os.walk(
            input_directory
        ):  # Recursively walk through directories
            for file in files:
                if file.endswith(".json"):
                    full_filepath = os.path.join(root, file)
                    interface_name = "I" + os.path.splitext(file)[0]
                    output_file = os.path.join(
                        output_directory, interface_name + ".sol"
                    )
                    self.abi2solidity_files(full_filepath, output_file, interface_name)


if __name__ == "__main__":

    IGNORE_PATHS = ["test/foundry/Misc/bitmaskCheck.sol", "forge-std/src/StdMath.sol",  ]

    abisPathIn = "out"
    abisPathOut = os.path.join("abi2json", "interfaces")

    converter = Abi2Interface()
    converter.convert_abis_in_directory(abisPathIn, abisPathOut)
