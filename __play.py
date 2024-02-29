bitmask = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF

address = 0x0000FFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000

print(hex(address & bitmask))
print(hex(bitmask))


ambassador = 23
project = 21

max_perc = 10000
ambassador = ambassador * 100
project = project * 100
creator = 10000

minusAmbPerc = max_perc - ambassador
time_perc = int(project * minusAmbPerc)
project = int(time_perc / max_perc)
creator -= project
creator -= ambassador

print(project)
print(ambassador)
print(creator)

print(creator + ambassador + project == 10000)

assert creator + ambassador + project == 10000

if __name__ == "__main__":
    print('Hello World')
