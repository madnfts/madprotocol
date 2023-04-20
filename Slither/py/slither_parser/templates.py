base_template = """
# MAD NFTs Audit

# Introduction

A time-boxed security review of the **MAD NFTs MArket Place** protocol was done by **Maffaz**, with a focus on the security aspects of the application's implementation.

# Disclaimer

A smart contract security review can never verify the complete absence of vulnerabilities. This is a time, resource and expertise bound effort where I try to find as many vulnerabilities as possible. I can not guarantee 100% security after the review or even if the review will find any problems with your smart contracts.

# About **Maffaz**

John Ashurst, or **Maffaz**, is an independent smart contract security researcher. He does his best to contribute to the blockchain ecosystem and its protocols by putting time and effort into security research.

# About **MAD NFTs**


## Unexpected/Interesting Design choices

The `withdraw` functionality is callable by anyone..


# Threat Model

## Roles & Actors

- ERC721 NFT Contract Owner
- ERC1155 Contract Owner
- Unauthorized User - anyone can call `withdraw` by just paying gas

## Security Interview

**Q:** What in the protocol has value in the market?

**A:** 


## Potential attacker's goals

- Place any method in the protocol into a state of DoS ???
- Steal another user's claimable tokens ???
- Exploit bugs in price calculations ???

## Potential ways for the attacker to achieve his goals

- Exploit errors or rounding downs in divisions in price calculations for personal benefit - division error
- 

# Severity classification

| Severity               | Impact: High | Impact: Medium | Impact: Low |
| ---------------------- | ------------ | -------------- | ----------- |
| **Likelihood: High**   | Critical     | High           | Medium      |
| **Likelihood: Medium** | High         | Medium         | Low         |
| **Likelihood: Low**    | Medium       | Low            | Low         |

**Impact** - the technical, economic and reputation damage of a successful attack

**Likelihood** - the chance that a particular vulnerability gets discovered and exploited

**Severity** - the overall criticality of the risk

# Security Assessment Summary

**_review commit hash_ - [c128e6780c557dc8eb432c6545ebc2411b26cbd3](https://github.com/madnfts/madnfts-solidity-contracts/tree/c128e6780c557dc8eb432c6545ebc2411b26cbd3)**

### Scope

The following smart contracts were in scope of the audit:

- `MAD.sol`

---
"""

check_template = """

## Severity

**Impact:** {}

**Likelihood:** {}

## Description

- {}: 

- {}

## Example / POC

## Recommendations

*[Slither Detectors Information](https://github.com/crytic/slither?s=35#detectors)*

---
"""

checks_header = """

# ERC Compliance Checks

"""

issues_found = """

The following number of issues were found, categorized by their severity:

- Critical: ? issues
- High: {} issues
- Medium: {} issues
- Low: {} issues
- Optimization: {} issues

"""
