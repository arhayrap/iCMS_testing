from getpass import getpass
import os
import sys

username = input("Type login: ")
password = getpass("Type password: ")

while (True):
    isAdmin  = input("Are you an admin? (y or n): ")
    if isAdmin == "y" or isAdmin == "yes":
        isAdmin = True
        break
    elif isAdmin == "n" or isAdmin == "no":
        isAdmin = False
        break

mode = sys.argv[1]
if sys.argv[2] != "":
    path_array = sys.argv[2]
else:
    path_array = 'cypress/integration'

if mode == "light" or mode == "entire":
    flags = {"login":username,"password":password,"mode":mode,"isAdmin":isAdmin}
    # os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    os.system("./node_modules/.bin/cypress open --env flags='{}'".format(str(flags).replace("'", '"'), path_array))
elif mode == "both":
    flags = {"login":username,"password":password,"mode":"light","isAdmin":isAdmin}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    flags = {"login":username,"password":password,"mode":"entire","isAdmin":isAdmin}
    os.system("./node_modules/.bin/cypress run --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
else:
    print("Available modes: 'light' or 'entire'.")

