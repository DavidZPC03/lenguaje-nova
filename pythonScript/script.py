import csv
from pprint import pprint


def read_csv_into_dict(filename):
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        data = [row for row in reader]
    return data


# Usage
data = read_csv_into_dict("matriz.csv")
print(data)
import csv


def read_csv_into_dict(filename):
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        data = [row for row in reader]
    return data


# Usage
data = read_csv_into_dict("matriz.csv")
pprint(data)
