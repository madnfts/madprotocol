bitmask = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF

address = 0x0000FFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000

print(hex(address & bitmask))
print(hex(bitmask))


# if __name__ == "__main__":
#     process_files()
