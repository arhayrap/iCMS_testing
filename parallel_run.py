from getpass import getpass
import os
import sys
import json
import time
import math

from multiprocessing import Pool, Manager, Value, cpu_count
from datetime import datetime
import coloredlogs
import logging

website = "epr" # tools, epr
n_web = {"tools": 36, "epr": 334}
path_web = {"tools": "cypress/integration/test_files_tools", "epr": "cypress/integration/test_files_epr"}


def Run_process(obj, n_jobs):
    flags = obj
    n_1 = math.floor(n_web[website] / n_jobs)
    REMOVE_OLD_RESULTS = "rm -r -f data/{website}_out/*.json".format(website = website)
    KILL_CYPRESS_PROCESSES = '''
    killall -9 Cypress
    killall -9 node
    '''
    # killall -9 `npm run cy:run`

    CREATE_FILES = '''
rm -f {path}/*.js
for i in {{1..{n}}}
do
echo "$(cat {path}/gen_{website}_part_1.txt)"                       >> "{path}/{website}_test_spec_$i.js"
echo "    let n = {n_1};"                                           >> "{path}/{website}_test_spec_$i.js"
if [ $i == {n} ];
then
echo "    let start = n*$((i-1));"                                  >> "{path}/{website}_test_spec_$i.js"
echo "    let end = {n_all_pages}-start;"                           >> "{path}/{website}_test_spec_$i.js"
else
echo "    let start = n*$((i-1));"                                  >> "{path}/{website}_test_spec_$i.js"
echo "    let end = start+n;"                                       >> "{path}/{website}_test_spec_$i.js"
fi
echo "    let out_path = 'data/{website}_out/{website}_out_' + $i + '.json';"     >> "{path}/{website}_test_spec_$i.js"
echo "$(cat {path}/gen_{website}_part_2.txt)"                       >> "{path}/{website}_test_spec_$i.js"
done
'''.format(path = path_web[website], website = website, n = n_jobs, n_1 = n_1, n_all_pages = n_web[website])
    RUN_COMMAND = "./node_modules/.bin/cypress-parallel -s cy:run -t {} -r -d '{}' -a '\"--env flags={}\"' ".format(n_jobs, path_web[website] + "/*.js", str(flags).replace("'", '"').replace(" ", ""))
    print(CREATE_FILES)
    os.system(KILL_CYPRESS_PROCESSES)
    os.system(REMOVE_OLD_RESULTS)
    os.system(CREATE_FILES)
    os.system(RUN_COMMAND)

if __name__ == '__main__':
    n_jobs = int(sys.argv[1])
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
    processes_names = ["process_"+str(i) for i in range(n_jobs)]
    Run_process(obj={"login":username, "password":password, "isAdmin":isAdmin}, n_jobs = n_jobs)