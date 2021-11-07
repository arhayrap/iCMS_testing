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

mode = input_object["mode"]
path_array = input_object["input_string"]
if path_array == "":
    path_array = 'cypress/integration'

if mode == "lite" or mode == "entire":
    flags = {"login":username,"password":password,"mode":mode}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    # os.system("./node_modules/.bin/cypress open --env flags='{}'".format(str(flags).replace("'", '"'), path_array))
elif mode == "both":
    flags = {"login":username,"password":password,"mode":"lite"}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    time.sleep(2)
    flags = {"login":username,"password":password,"mode":"entire"}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
else:
    print("Available modes: 'lite' or 'entire'.")

