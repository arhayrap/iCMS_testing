from getpass import getpass
import os
import sys
import json
import time

# suite_path = "cypress/integration/test_files_epr/"
# path_array = [suite_path + "*_3.js"]
# path_array = [suite_path + "epr_*.js"]

suite_path = "cypress/integration/"
path_array = [suite_path + "*.js"]

def Run_process(path, obj):
    print(path)
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(obj).replace("'", '"'), path))

if __name__ == '__main__':
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
    for i in path_array:
        path = i
        Run_process(path=i, obj={"login":username, "password":password, "isAdmin":isAdmin})
