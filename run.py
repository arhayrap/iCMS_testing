from getpass import getpass
import os
import sys
import json
import time

input_object = json.loads(open(sys.argv[1], "r").read())

username = input("Type login: ")
password = getpass("Type password: ")

while (True):
    isAdmin = input("Are you an admin? (y or n): ")
    if isAdmin == "y" or isAdmin == "yes":
        isAdmin = "true"
        break
    elif isAdmin == "n" or isAdmin == "no":
        isAdmin = "false"
        break

path_array = input_object["input_string"]
if path_array == "":
    path_array = 'cypress/integration'

flags = {"login":username,"password":password, "isAdmin":isAdmin}
# os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
os.system("./node_modules/.bin/cypress open --env flags='{}'".format(str(flags).replace("'", '"'), path_array))