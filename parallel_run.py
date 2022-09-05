from getpass import getpass
import os
import sys
import json
import time
import math
from jsmin import jsmin

from multiprocessing import Pool, Manager, Value, cpu_count

from datetime import datetime
import coloredlogs
import logging


links_tools = json.load(open("cypress/fixtures/tools_links.json"))[0]["links"]
links_epr   = json.load(open("cypress/fixtures/epr_links.json"))[0]["links"]
website = "epr" # tools, epr len(links_tools)
n_web = {"tools": len(links_tools), "epr": len(links_epr)}
path_web = {"tools": "cypress/integration/test_files_tools", "epr": "cypress/integration/test_files_epr"}

def Run_process(obj, n_jobs):
    flags = obj
    n_1_old = math.floor(n_web[website] / n_jobs)
    n_1 = n_web[website]
    REMOVE_OLD_RESULTS = "rm -r -f data/{website}_output/*.json".format(website = website)
    KILL_CYPRESS_PROCESSES = '''
    killall -9 Cypress
    killall -9 node
    killall -9 top
    killall -9 `npm run cy:run`
    killall -9 Xvfb
    '''

    CREATE_FILES_OLD = '''
rm -f {path}/*.js
rm -f -r runner-results
rm -f multi-reporter-config.json
rm -f cypress/parallel-weights.json
for i in {{1..{n}}}
do
echo "$(cat {path}/gen_{website}_part_1_old.txt)"                   >> "{path}/{website}_test_spec_$i.js"
echo "    let n = {n_1};"                                           >> "{path}/{website}_test_spec_$i.js"
echo "    it('Wait for its turn.', () => {bracket_sign_open}"       >> "{path}/{website}_test_spec_$i.js"
echo "        cy.wait(10000 * $((i)))"                               >> "{path}/{website}_test_spec_$i.js"
echo "    {bracket_sign_close});"                                   >> "{path}/{website}_test_spec_$i.js"
if [ $i == {n} ];
then
echo "    let start = n*$((i-1));"                                  >> "{path}/{website}_test_spec_$i.js"
echo "    let end = {n_all_pages}-start;"                           >> "{path}/{website}_test_spec_$i.js"
else
echo "    let start = n*$((i-1));"                                  >> "{path}/{website}_test_spec_$i.js"
echo "    let end = start+n;"                                       >> "{path}/{website}_test_spec_$i.js"
fi
echo "    let total = n;"                                           >> "{path}/{website}_test_spec_$i.js"
echo "    let out_path = 'data/{website}_output/{website}_out_' + $i + '.json';"     >> "{path}/{website}_test_spec_$i.js"
echo "$(cat {path}/gen_{website}_part_2_old.txt)"                   >> "{path}/{website}_test_spec_$i.js"
done
'''.format(path = path_web[website], website = website, n = n_jobs, n_1 = n_1_old, n_all_pages = n_web[website], bracket_sign_open = "{", bracket_sign_close = "}")

    CREATE_FILES = '''
rm -f {path}/*.js
rm -f -r runner-results
rm -f multi-reporter-config.json
rm -f cypress/parallel-weights.json
for i in {{1..{n}}}
do
echo "$(cat {path}/gen_{website}_part_1.txt)"                       >> "{path}/{website}_test_spec_$i.js"
echo "    let n = {n_1};"                                           >> "{path}/{website}_test_spec_$i.js"
echo "    let job = $((i-1));"                                      >> "{path}/{website}_test_spec_$i.js"
echo "    it('Wait for its turn.', () => {bracket_sign_open}"       >> "{path}/{website}_test_spec_$i.js"
echo "        cy.wait(10000 * $((i)))"                               >> "{path}/{website}_test_spec_$i.js"
echo "    {bracket_sign_close});"                                   >> "{path}/{website}_test_spec_$i.js"
echo "    let start = $i;"                                          >> "{path}/{website}_test_spec_$i.js"
echo "    let end = n;"                                             >> "{path}/{website}_test_spec_$i.js"
echo "    let total = n;"                                           >> "{path}/{website}_test_spec_$i.js"
echo "    let step = {step};"                                       >> "{path}/{website}_test_spec_$i.js"
echo "    let out_path = 'data/{website}_output/{website}_out_' + $i + '.json';"     >> "{path}/{website}_test_spec_$i.js"
echo "$(cat {path}/gen_{website}_part_2.txt)"                       >> "{path}/{website}_test_spec_$i.js"
done
'''.format(path = path_web[website], website = website, n = n_jobs, n_1 = n_1, n_all_pages = n_web[website], step = n_jobs, bracket_sign_open = "{", bracket_sign_close = "}")

    RUN_COMMAND = "./node_modules/.bin/cypress-parallel -s cy:run CYPRESS_NO_COMMAND_LOG=1 -t {} -r -d '{}' --js-flags=--expose-gc -a '\"--env flags={}\"' ".format(n_jobs, path_web[website] + "/*.js", str(flags).replace("'", '"').replace(" ", ""))
    # RUN_COMMAND = "./node_modules/.bin/cypress-parallel -s cy:run -t {} -r -d '{}' --js-flags=--expose-gc -a '\"--env flags={}\"' ".format(n_jobs, path_web[website] + "/*_min.js", str(flags).replace("'", '"').replace(" ", ""))
    os.system(REMOVE_OLD_RESULTS)
    os.system(CREATE_FILES)
    os.system(KILL_CYPRESS_PROCESSES)
    '''
    print(CREATE_FILES_OLD)
    for i in range(1, n_jobs + 1):
        with open("{path}/{website}_test_spec_{ind}.js".format(path = path_web[website], website = website, ind = i), "r") as f:
            minified = jsmin(f.read())
            with open("{path}/{website}_test_spec_{ind}_min.js".format(path = path_web[website], website = website, ind = i), "w") as new_f:
                new_f.write(minified)
    '''
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
