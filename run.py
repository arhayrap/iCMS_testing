from getpass import getpass
import os
import sys

username = input("Type login: ")
password = getpass("Type password: ")
mode = sys.argv[1]
if sys.argv[2] != None:
    path_array = sys.argv[2]
else:
    path_array = 'cypress/integration'

if mode == "light" or mode == "entire":
    flags = {"login":username,"password":password,"mode":mode}
    # os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    os.system("./node_modules/.bin/cypress open --env flags='{}'")
elif mode == "both":
    flags = {"login":username,"password":password,"mode":"light"}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    flags = {"login":username,"password":password,"mode":"entire"}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
else:
    print("Available modes: 'light' or 'entire'.")

