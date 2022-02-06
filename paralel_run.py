from getpass import getpass
import os
import sys
import json
import time

from multiprocessing import Pool, Manager, Value, cpu_count
from datetime import datetime
import coloredlogs
import logging

def Run_process(name, process_id, n_jobs, obj):
    logger = setup_logger()
    logger.info(f"Testing page: {name}...")
    flags = obj; #{"login":username, "password":password, "isAdmin":isAdmin, "process_id":process_id}
    flags["process_id"] = process_id
    flags["process_jobs"] = n_jobs
    print(process_id)
    os.system("./node_modules/.bin/cypress run --record --key vqffbq --ci-build-id gitlab --parallel")
    # os.system("./node_modules/.bin/cypress open --record --key=abc123 --ci-build-id --parallel")


    # os.system("./node_modules/.bin/cypress run --record --parallel --key ci-key --ci-build-id --env flags='{}' --spec {}".format(str(flags).replace("'", '"'), path_array))
    # os.system("./node_modules/.bin/cypress open --record --parallel --key ci-key --ci-build-id --env flags='{}'".format(str(flags).replace("'", '"'), path_array))

LOG_LEVEL = "DEBUG"

def setup_logger(name: str = __name__, level: str = LOG_LEVEL) -> logging.Logger:
    assert level in ["NOTSET", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

    logging.basicConfig(
        format="%(asctime)s %(name)s[%(process)d] %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        level=level,
        handlers=[logging.StreamHandler()]
    )

    logger = logging.getLogger(name)
    coloredlogs.install(level=level, logger=logger, isatty=True)

    return logger

def execute_process(name: str, queue: Value) -> None:
    logger = setup_logger()
    logger.info(f"Executing process: {name}...")
    time.sleep(5)
    queue.value -= 1

def create_processes(processes_names: str, obj: dict, n_jobs: int, waiting_time: int = 1) -> None:
    logger = setup_logger()

    if n_jobs <= 0:
        n_jobs = cpu_count()

    manager = Manager()
    pool = Pool(processes=n_jobs)
    queue = manager.Value('i', 0)
    lock = manager.Lock()
    start_time = datetime.now()

    with lock:
        for name in processes_names:
            while True:
                if queue.value < n_jobs:
                    queue.value += 1
                    pool.apply_async(
                        func=Run_process,
                        args=(name, queue.value, n_jobs, obj)
                    )
                    break
                else:
                    logger.debug(f"Pool full ({n_jobs}): waiting {waiting_time} seconds...")
                    time.sleep(waiting_time)

    pool.close()
    pool.join()

    exec_time = datetime.now() - start_time
    logger.info(f"Execution time: {exec_time}")


if __name__ == '__main__':
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
    # processes_names = json.loads(open("./cypress/fixtures/tools_links.json", "r").read())[0]["links"]
    # print(processes_names)
    n_jobs = 1
    processes_names = ["process_"+str(i) for i in range(n_jobs)]
    #len(processes_names) # Number of jobs to run in parallel.
    # Run_process(processes_names[0], 0, 36, obj = {"login":username, "password":password, "isAdmin":isAdmin})
    # Creating and executing processes in parallel:
    create_processes(processes_names=processes_names, obj={"login":username, "password":password, "isAdmin":isAdmin}, n_jobs=n_jobs)
