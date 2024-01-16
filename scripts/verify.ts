import { run } from "hardhat"

export const verifyContract = async (contractAddress: string, args: any[]) => {
    console.log(`Verifying contract: ${contractAddress} with args: ${args}`)
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log(`Contract: ${contractAddress} verified!`)
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}
