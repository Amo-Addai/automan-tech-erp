import sys, os, time, logging


def getCurrentWorkingDirectory():
    cwd = os.getcwd()  # USE THIS FOR DEVELOPMENT PURPOSES, AND THE PATH BELOW WHEN TESTING DIRECTLY FROM THE DASHBOARD :)
    if cwd.endswith("automan"):  # DO THIS IN CASE CURRENT DIRECTORY IS THIS USER'S (automan) FOLDER
        cwd += "/Desktop/LEVEL_400_PROJECT/PROJECT_API/API_DASHBOARD/server/config/AUTO_SECURITY/AUTO_AUDITING/EXTERNAL/SOURCES/AUTO_AUDITING_SLEEPER/"
    elif cwd.endswith("API_DASHBOARD"):  # DO THIS IN CASE CURRENT DIRECTORY IS THIS AUTO-API's FOLDER
        cwd += "/server/config/AUTO_SECURITY/AUTO_AUDITING/EXTERNAL/SOURCES/AUTO_AUDITING_SLEEPER/"
    return cwd


def main():  # GET CLI ARGUMENTS, THEN BEGIN SEEDING THE DUMMY DATA TO CORRESPONDING LOG FILE
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')
    logging.info("")
    logging.info("DUMMY DATA COLLECTOR RUNNING NOW ...")
    logging.info("ARGUMENTS -> {}".format(sys.argv))
    try:
        duration, source, filename,  = sys.argv[1], sys.argv[2], sys.argv[3]
        if (filename is not None) and (len(filename) > 0) and (source is not None) and (len(source) > 0):
            logging.info("FILE -> " + source + "/" + filename)
            sourceFilePath = "{}MODEL/SAMPLE_LOG_FILES/{}/DATA/SAMPLE_LOG_FILES/{}".format(getCurrentWorkingDirectory(),
                                                                                           source, filename)
            destFilePath = "{}MODEL/LOG_FILES/{}/{}".format(getCurrentWorkingDirectory(), source, filename)
            logging.info("SOURCE FILE PATH -> " + sourceFilePath)
            logging.info("DESTINATION FILE PATH -> " + destFilePath)
            with open(sourceFilePath, "r") as sourceFile:
                logging.info("READING SOURCE FILE NOW ...")
                lines = sourceFile.readlines()
                logging.info("{} lines".format(len(lines)))
                if len(lines) > 0:
                    logging.info("WRITING TO DESTINATION FILE NOW ...")
                    for line in lines:
                        with open(destFilePath, "a") as destFile:
                            destFile.write(line)
                        time.sleep(int(duration))
                    # USING THIS PREVENTS THIS PROGRAM FROM EVER FINISHING, SO AUTO-SLEEPER CANNOT CONTINUE
                    # THERFORE, FIND A WAY TO MAKE AUTO-SLEEPER RUN THIS PROGRAM ASYNCHRONOUSLY
                    # SO IT DOESN'T WAIT FOR THIS PROGRAM TO FINISH EXECUTING
                else:
                    logging.info("NO DATA AVAILABLE IN SOURCE FILE")
        else:
            logging.info("SORRY, CANNOT RUN DUMMY DATA COLLECTOR")
    except Exception as e:
        logging.info("ERROR")
        logging.info(e)


if __name__ == '__main__':
    main()
