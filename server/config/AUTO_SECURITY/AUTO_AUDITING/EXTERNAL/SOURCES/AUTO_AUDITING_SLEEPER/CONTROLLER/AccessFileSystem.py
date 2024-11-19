import subprocess, os, json, time, asyncio, logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from CONTROLLER.AutoParser import AutoParser

#    THIS CANNOT BE IMPORTED COZ IT CAUSES A CYCLIC DEPENDENCY :(
# from AutoAuditingSleeperApp import getApp

'''
THIS CLASS IS MAINLY USED TO ISSUE COMMANDS TO AUTO-AUDIT SOURCES/TOOLS TO BEGIN OPERATIONS,
AND ALSO TO MONITOR THE CORRESPONDING FILE LOGS OF THESE SOURCES/TOOLS
'''


def getCurrentWorkingDirectory():
    cwd = os.getcwd()  # USE THIS FOR DEVELOPMENT PURPOSES, AND THE PATH BELOW WHEN TESTING DIRECTLY FROM THE DASHBOARD :)
    if cwd.endswith("automan"):  # DO THIS IN CASE CURRENT DIRECTORY IS THIS USER'S (automan) FOLDER
        cwd += "/Desktop/LEVEL_400_PROJECT/PROJECT_API/API_DASHBOARD/server/config/AUTO_SECURITY/AUTO_AUDITING/EXTERNAL/SOURCES/AUTO_AUDITING_SLEEPER/"
    elif cwd.endswith("API_DASHBOARD"):  # DO THIS IN CASE CURRENT DIRECTORY IS THIS AUTO-API's FOLDER
        cwd += "/server/config/AUTO_SECURITY/AUTO_AUDITING/EXTERNAL/SOURCES/AUTO_AUDITING_SLEEPER/"
    return cwd


cwd = getCurrentWorkingDirectory()
cmds_files = {
    "autoaudits": {
        "Network Connection Tracking": {
            "Bro": {
                "cmds": ["bro <ip_address>"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/",
                        "format": "folder",
                        "inner-files": {
                            "conn.log": {  # SAMPLE LOG FILE IS TOO LARGE THAT DUMMY COLLECTOR FREEZES IN THE PROCESS
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/conn.log",
                                "format": "tsv"
                            },
                            "http.log": {  # SAMPLE LOG FILE IS TOO LARGE THAT DUMMY COLLECTOR FREEZES IN THE PROCESS
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/http.log",
                                "format": "tsv"
                            },
                            "ssh.log": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/ssh.log",
                                "format": "tsv"
                            },
                            "ftp.log": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/ftp.log",
                                "format": "tsv"
                            },
                            "smtp.log": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/smtp.log",
                                "format": "tsv"
                            },
                            # "ssl.log": {
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/ssl.log",
                            #     "format": "tsv"
                            # },
                            # "dhcp.log": {
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/dhcp.log",
                            #     "format": "tsv"
                            # },
                            # "dns.log": {  # SAMPLE LOG FILE IS TOO LARGE THAT DUMMY COLLECTOR FREEZES IN THE PROCESS
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/dns.log",
                            #     "format": "tsv"
                            # },
                        }
                    },
                }
            },
            "Kismet": {
                "cmds": ["kismet <ip_address>"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Kismet/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
        },
        "Intrusion Detection": {
            "Bro": {
                "cmds": ["bro <ip_address>"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/",
                        "format": "folder",
                        "inner-files": {
                            "notice.log": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/notice.log",
                                "format": "tsv"
                            },
                            # "signatures.log": {
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/signatures.log",
                            #     "format": "tsv"
                            # },
                            # "files.log": {
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Bro/files.log",
                            #     "format": "tsv"
                            # },
                        }
                    },
                }
            },
            "Snort": {
                "cmds": ["path/to/snort -c snort.conf -A fast -h <ip_address>"],
                # eg. ./snort -c snort.conf -A fast -h <ip_address>
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Snort/",
                        "format": "folder",
                        "inner-files": {
                            "alert.fast": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Snort/alert.fast",
                                "format": "line"
                            },
                            # "alert.full": {  # BEFORE MONITORING THIS FILE, REMOVE '-A fast' FROM THE COMMANDS
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Snort/alert.full",
                            #     "format": "line-bulk"
                            # },
                        }
                    },
                }
            },
            "Ossec": {
                "cmds": ["path/to/ossec-control start"],  # eg. /var/ossec/bin/ossec-control start
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Ossec/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
            "Kismet": {
                "cmds": ["kismet <ip_address>"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Kismet/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
        },
        "Vulnerability Scanning": {
            "Nikto": {
                "cmds": ["nikto -h <ip_address_or_host_name> -o csv", "nikto -h <ip_address_or_host_name> -o xml"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Nikto/",
                        "format": "folder",
                        "inner-files": {
                            "-csv.csv": {
                                "path": "{}".format(cwd) + "MODEL/LOG_FILES/Nikto/<ip_address_or_host_name>-csv.csv",
                                "format": "csv"
                            },
                            # "-xml.xml": {
                            #     "path": "{}".format(cwd) + "MODEL/LOG_FILES/Nikto/<ip_address_or_host_name>-xml.xml",
                            #     "format": "xml"
                            # },
                        }
                    },
                }
            },
            "OpenVAS": {
                "cmds": [],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/OpenVAS/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
        },
        "System Auditing": {
            "Lynis": {
                "cmds": ["/path/to/lynis audit system"],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Lynis/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
        },
        "AntiVirus Scanning": {
            "Some AntiVirus Scanner": {
                "cmds": [],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/Some AntiVirus Scanner/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            },
        },
    },

    "actions": {
        "some action": {
            "some source": {
                "cmds": [],
                "files": {
                    "general": {
                        "path": "{}".format(cwd) + "MODEL/LOG_FILES/some source/",
                        "format": "folder",
                        "inner-files": {
                        }
                    },
                }
            }
        }
    }
}


class CustomFileSystemEventHandler(FileSystemEventHandler):
    def __init__(self, autoauditOrActionType, autoauditOrAction, source, filename, pathFormat, params):
        self.params = params
        self.type = autoauditOrActionType
        self.autoauditOrAction = autoauditOrAction
        self.source = source
        self.filename = filename
        self.pathFormat = pathFormat
        # NOW, SETUP THIS CLASS' AutoParser OBJECT PROPERTY
        self.autoParsers = {}
        if self.filename is "general":  # or (self.pathFormat["format"] is "folder"):
            print("THIS IS A GENERAL EVENT HANDLER, THEREFORE CREATING MULTIPLE AUTO-PARSERS ...")
            innerFiles = self.pathFormat["inner-files"]
            for filename, pathFormat in innerFiles.items():  # IMPLEMENT FILE-MONITORING FUNCTIONALITY RIGHT HERE :)
                if (filename is not None) and (len(filename) > 0):
                    print("")
                    print("ADDING AUTO-PARSER FOR FILE -> " + filename)
                    print("INNER PATH FORMAT -> {}".format(pathFormat))
                    self.autoParsers[filename] = AutoParser(self.type, self.autoauditOrAction, self.source, filename,
                                                            pathFormat, self.params)
                    print("AUTO-PARSER -> {}".format(self.autoParsers[filename].toString()))
        else:
            print("THIS IS A SPECIFIC EVENT HANDLER, THEREFORE CREATING JUST A SPECIFIC AUTO-PARSER ...")
            print("PATH FORMAT -> {}".format(self.pathFormat))
            self.autoParsers[self.filename] = AutoParser(self.type, self.autoauditOrAction, self.source, self.filename,
                                                         self.pathFormat, self.params)
            print("AUTO-PARSER -> {}".format(self.autoParsers[self.filename].toString()))
        print("")
        print("NUMBER OF AUTO-PARSERS -> {}".format(len(self.autoParsers)))

    def __del__(self):
        logging.info("RUNNING DEINITIALIZER FOR EVENT HANDLER FOR FILE '{}/{}'".format(self.source, self.filename))
        for filename, autoParser in self.autoParsers.items():
            del autoParser

    def toString(self):
        return "{}: '{}' ({}) -> {} : '{}' ({})".format(self.type, self.autoauditOrAction, self.source, self.filename,
                                                        self.pathFormat["path"], self.pathFormat["format"])

    def getFilename(self, path):
        try:
            logging.info("GETTING FILENAME USING PATH -> " + path)
            # DON'T USE THIS COMMENTED PART OF THIS IF-STATEMENT COZ NOT ALL LOG FILES END WITH ".log"
            # and (self.filename.endswith(".log")):  #   <=== THIS CODE IS WHAT YOU SHOULDN'T USE ANYMORE ...
            if (self.filename is not "general") and (self.filename in path) and (path.endswith(self.filename)):
                logging.info("THIS FILENAME/PATH IS AN ACTUAL PATH TO FILE, NOT A FOLDER")
                return self.filename
            elif (self.filename is "general") and ("inner-files" in self.pathFormat) \
                    and type((self.pathFormat["inner-files"]) is dict):  # CHECK IF IT'S A DICTIONARY
                logging.info("THIS FILENAME/PATH IS A FOLDER, THEREFORE LOOPING THROUGH THE POSSIBLE FILES ...")
                for key, value in self.pathFormat["inner-files"].items():
                    logging.info("CHECKING FOR FILE -> " + key + " WITH PATH -> " + path)
                    if (key in path) and (path.endswith(key)) and ("path" in value) and ("format" in value) \
                            and (key in self.pathFormat["inner-files"]):  # THOUGH FILE IS WITHIN THIS "general" FOLDER
                        # DO THIS IN CASE THIS FILENAME key IS NOT INCLUDED WITHIN FILES TO MONITOR FOR THIS AUDIT
                        return key
        except:
            logging.info("ERROR IN RETRIEVING FILENAME")
        return None

    def processFile(self, path):
        logging.info("PROCESSING (LOG) FILE -> " + path)
        if self.filename is "general":
            logging.info("PATH IS THE " + self.filename + " DIRECTORY PATH")
        elif self.filename not in path:  # DO THIS FIRST, BEFORE MOVING ON TO VALIDATION OF THE path
            path += self.filename
            logging.info("PATH WAS FOR DIRECTORY, THEREFORE FILENAME APPENDED -> " + path)
        else:
            logging.info("PATH ALREADY INCLUDES FILENAME -> " + self.filename)
        if (self.filename is "general") or ((self.filename in path) and (self.source in path)):
            logging.info(
                "PATH INDEED INCLUDES THIS INSTANCE'S SOURCE AND FILENAME -> {}/{}".format(self.source, self.filename))
            try:
                if os.path.exists(path) and os.path.isfile(path):
                    # GET STRING FROM LAST INDEX OF path TO END OF STRING TO GET THE ACTUAL FILENAME
                    filename = self.getFilename(path)
                    logging.info("FILENAME -> " + (filename if (filename is not None) else "-"))
                    if filename is not None:
                        res = self.autoParsers[filename].processFile(path)
                        # WORK WITH res HOWEVER YOU SEE FIT ..
                    else:
                        logging.info("SORRY AUTO-PARSER CANNOT PROCESS THIS FILE")
                else:
                    logging.info("PATH IS NOT A FILE, OR DOES NOT EXIST -> " + path)
            except Exception as e:
                logging.info("SOME ERROR OCCURED DURING READING OF PATH -> " + path)
        else:
            logging.info("PATH NOT VALID")

    def process(self, event):
        """
        event.event_type : modified/created/moved/deleted
        event.is_directory : Boolean
        event.src_path : file/dir path
        """
        logging.info("")
        logging.info("")
        logging.info("FILE MONITORING WORKS --->>> '{}' '{}'".format(event.event_type, event.src_path))
        if event.is_directory:
            return
        logging.info("EVENT HAS TO DO WITH A FILE, NOT A FOLDER ....")
        if event.event_type == 'modified':
            logging.info("THIS WAS A 'modified' EVENT, THEREFORE PROCESSING (LOG) FILE")
            self.processFile(event.src_path)
        else:
            logging.info("THIS WAS NOT A 'modified' EVENT, THEREFORE NOT PROCESSING (LOG) FILE")

    # def on_any_event(self, event):
    #     super(CustomFileSystemEventHandler, self).on_any_event(event)
    #     self.process(event)

    """
    FIND AN "UNSCHEDULE" EVENT HANDLER METHOD FOR THIS EVENT HANDLER OBJECT
    SO WHEN OBSERVER UNSCHEDULES THIS OBJECT, IT'S AUTOPARSER SAVES ALL "PROCESSED ENTRIES" DATA INTO PREFERENCE FILE
    """

    def on_modified(self, event):
        super(CustomFileSystemEventHandler, self).on_modified(event)
        self.process(event)

    def on_created(self, event):
        super(CustomFileSystemEventHandler, self).on_created(event)
        self.process(event)

    def on_deleted(self, event):
        super(CustomFileSystemEventHandler, self).on_deleted(event)
        self.process(event)

    def on_moved(self, event):
        super(CustomFileSystemEventHandler, self).on_moved(event)
        self.process(event)


class AccessFileSystem:
    def __init__(self, params):
        self.params = params
        # DO THIS SO YOUR EVENT HANDLER CLASS CAN LOG TO CONSOLE WHILE MONITORING FILE SYSTEM ...
        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(message)s',
                            datefmt='%Y-%m-%d %H:%M:%S')
        self.eventHandlers = []
        self.observer = Observer()

    async def performAutoAuditOrAction(self, autoauditOrActionType, autoauditOrAction, sources):
        try:
            autoauditOrActionObj = cmds_files[autoauditOrActionType + "s"][autoauditOrAction]
            if autoauditOrActionObj is not None:
                print("OBJECT -> " + json.dumps(autoauditOrActionObj))
                print("")
                print("SOURCES -> " + json.dumps(sources))
                commandsToRun, dummyCollectors = {}, {}
                for source, extra in sources.items():
                    if source in autoauditOrActionObj:
                        print("")
                        print("")
                        print("NOW, WORKING WITH SOURCE '" + source + "' WITH EXTRA PARAMS -> " + json.dumps(extra))
                        executionParams = autoauditOrActionObj[source]  # NOW WORK WITH .cmd & .files (EXEC & MONITOR)
                        print("DEFAULT COMMAND AND FILES TO MONITOR -> " + json.dumps(executionParams))
                        executionParams = self.getRefinedExecutionParams(autoauditOrActionType, autoauditOrAction,
                                                                         source, extra,
                                                                         executionParams)
                        print("")
                        print("REFINED COMMAND AND FILES TO MONITOR -> {}".format(executionParams))
                        #   SETUP ASYNCHRONOUS FUNCTIONALITY 
                        files, cmds = executionParams["files"], executionParams["cmds"]
                        print("FIRSTLY, BEGINNING ASYNC FILE-MONITORING")
                        for filename, pathFormat in files.items():  # IMPLEMENT FILE-MONITORING FUNCTIONALITY RIGHT HERE :)
                            if (filename is not None) and (len(filename) > 0):
                                # THIS HAS TO BE MADE ASYNC, SO 1 FILE DOESN'T WAIT FOR PREVIOUS FILE TO FINISH SETTING UP WITH THE DUMMY COLLECTOR
                                result = await self.monitorFile(autoauditOrActionType, autoauditOrAction, source,
                                                                filename, pathFormat)
                                print(result)
                        dummyCollectors[source] = files
                        commandsToRun[source] = cmds
                    else:
                        print("SORRY, SOURCE '" + source + "' IS NOT AVAILABLE")
                # DONE LOOPING THROUGH SOURCES' EXECUTION PARAMS, READY TO BEGIN FILE MONITORING ...
                print("")
                print("DONE SCHEDULING ALL OBSERVERS TO EACH PATH, STARTING OBSERVER NOW")
                self.observer.start()
                print("")
                print("NOW, EXECUTING DUMMY DATA COLLECTOR FOR ALL MONITORED FILES")
                print("")
                # print("DUMMY COLLECTOR DATA -> {}".format(dummyCollectors))
                result = await self.callDummyDataCollectors(dummyCollectors)
                print(result)
                #
                print("")
                print("SECONDLY, BEGINNING COMMANDS EXECUTION")
                print("")
                # print("COMMANDS DATA -> {}".format(commandsToRun))
                for source, cmds in commandsToRun.items():
                    print("")
                    print("NOW, EXECUTING COMMANDS WITH SOURCE {}".format(source))
                    for cmd in cmds:  # YOU DON'T HAVE TO CALL cmds.items() COZ cmds IS ALREADY A LIST OBJECT (NOT DICTIONARY :)
                        result = await self.executeCommand(cmd)
                        print(result)
                        # NOW, WORK WITH result HOWEVER YOU WANT (YOU CAN ACKNOWLEDGE AUTO-API OF SUCCESS/FAILURE)
                print("")
                print("NOW, RUNNING INFINITE LOOP FOR MONITORING SELECTED FILES")
                print("")
                try:
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    await self.stopFileMonitoring()
                return True
            else:
                print(
                    "SORRY, " + autoauditOrActionType + " '" + autoauditOrAction + "' CANNOT BE PERFORMED BY THIS AUTO-AUDITING SLEEPER PROGRAM")
        except Exception as e:
            print("ERROR -> " + e.message)
        return False

    def getRefinedExecutionParams(self, autoauditOrActionType, autoauditOrAction, source, extra, executionParams):
        if (autoauditOrActionType == "autoaudit") and (autoauditOrAction == "Vulnerability Scanning") \
                and (source == "Nikto"):
            shouldExit = True
            extra["ip_address_or_host_name"] = "STUDENT"  # THIS SHOULD BE COMMENTED DOE :))
            if "ip_address_or_host_name" in extra:
                print("NIKTO, TO PERFORM VULNERABILITY SCANNING ON '{}', MODIFYING COMMANDS & FILE NAMES ...".format(
                    extra["ip_address_or_host_name"]))
                i = 0
                for cmd in executionParams["cmds"]:
                    if "<ip_address_or_host_name>" in cmd:
                        print("")
                        print("SETTING IP_ADDR/HOST_NAME IN CMD -> {}".format(cmd))
                        cmd = cmd.replace("<ip_address_or_host_name>", extra["ip_address_or_host_name"])
                        executionParams["cmds"][i] = cmd
                        print("COMMAND NOW -> {}".format(executionParams["cmds"][i]))
                        i += 1
                for file, data in executionParams["files"].items():
                    if (file == "general") or (
                                    ("format" in data) and (data["format"] == "folder") and ("inner-files" in data)):
                        print("THIS IS A NIKTO FOLDER, LOOKING AT THE INNER FILES NOW ..")
                        for innerFile, innerData in data["inner-files"].items():
                            print("FILE '{}' -> {}".format(innerFile, innerData))
                            if (innerFile == "-csv.csv") or (innerFile == "-xml.xml"):
                                if (innerData["format"] in innerFile) and (
                                            "<ip_address_or_host_name>" in innerData["path"]):
                                    innerData["path"] = innerData["path"].replace("<ip_address_or_host_name>",
                                                                                  extra["ip_address_or_host_name"])
                                    print("PATH NOW -> {}".format(innerData["path"]))
                                    if not os.path.isfile(innerData["path"]):
                                        print("CREATING FILE SO IT COULD BE MONITORED")
                                        f = open(innerData["path"], "w+")
                                        f.close()
                                    else:
                                        print("FILE ALREADY EXISTS, CLEARING IT'S DATA SO IT CAN BE MONITORED")
                                        pass
                                    shouldExit = False
                                del data["inner-files"][innerFile]
                                genericFileName = extra["ip_address_or_host_name"] + innerFile
                                data["inner-files"][genericFileName] = innerData
                                print("")
                                print("SET INNER FILE '{}' DATA NOW -> {}".format(genericFileName,
                                                                                  data["inner-files"][genericFileName]))
                        executionParams["files"][file] = data
                        print("")
                        print("SET FOLDER '{}' DATA NOW -> {}".format(file, executionParams["files"][file]))
                    else:
                        print("THIS IS A NIKTO FILE, NOT A FOLDER ..")
                        print("FILE '{}' -> {}".format(file, data))
                        if (file == "-csv.csv") or (file == "-xml.xml"):
                            if (data["format"] in file) and ("<ip_address_or_host_name>" in data["path"]):
                                data["path"] = data["path"].replace("<ip_address_or_host_name>",
                                                                    extra["ip_address_or_host_name"])
                                print("PATH NOW -> {}".format(data["path"]))
                                if not os.path.isfile(data["path"]):
                                    print("CREATING FILE SO IT COULD BE MONITORED")
                                    f = open(data["path"], "w+")
                                    f.close()
                                else:
                                    print("FILE ALREADY EXISTS, CLEARING IT'S DATA SO IT CAN BE MONITORED")
                                    pass
                                shouldExit = False
                            del executionParams["files"][file]
                            genericFileName = extra["ip_address_or_host_name"] + file
                            executionParams["files"][genericFileName] = data
                            print("")
                            print("SET FILE '{}' DATA NOW -> {}".format(genericFileName,
                                                                        executionParams["files"][genericFileName]))
            if shouldExit:
                print("")
                print("INVALID PARAMS FOR NIKTO TO RUN VULNERABILITY SCAN, EXITING AUTO-AUDITING SLEEPER PROGRAM ..")
                exit(0)
        print("REFINED EXECUTION PARAMS -> {}".format(executionParams))
        return executionParams  # JUST RETURN THIS FOR NOW :)

    async def monitorFile(self, autoauditOrActionType, autoauditOrAction, source, filename, pathFormat):
        #   MAKE SURE THAT YOU SET UP MONITORING ON THIS FILE ASYNCHRONOUSLY
        try:
            print("")
            if ("path" in pathFormat) and (len(pathFormat["path"]) > 0) and (os.path.isdir(pathFormat["path"])):
                print("NOW, MONITORING FILE -> " + source + " : " + filename)
                print(pathFormat["path"])
                # PERFORM FILE MONITORING WITHIN THIS PROGRAM INTERNALLY
                event_handler = CustomFileSystemEventHandler(autoauditOrActionType, autoauditOrAction, source, filename,
                                                             pathFormat, self.params)
                print("EVENT HANDLER OBJECT CREATED FOR THIS FILE")
                print(event_handler.toString())
                event_handler.processFile(event_handler.pathFormat["path"])
                self.observer.schedule(event_handler, path=event_handler.pathFormat["path"], recursive=True)
                self.eventHandlers.append(event_handler)
                return "FILE SETUP FOR MONITORING"
            else:
                return "FILE '{}' HAS NO VALID PATH TO BE MONITORED".format(filename)
        except Exception as e:
            print(e)
            return "ERROR DURING SETUP OF FILE (" + source + ":" + filename + ") FOR MONITORING"

    async def stopFileMonitoring(self):  # STOP FILE MONITORING WITHIN THIS PROGRAM INTERNALLY
        self.observer.unschedule_all()
        self.observer.stop()  # THIS MUST HAVE TO WORK FOR EITHER ALL FILES BEING MONITORED, OR JUST 1 SPECIFIC FILE (YOUR CHOICE :)
        self.observer.join()
        for eventHandler in self.eventHandlers:
            del eventHandler
        print("STOPPED FILE SYSTEM MONITORING ...")
        return "FILE SYSTEM MONITORING ABORTED"

    async def executeCommand(self, cmd):
        print("")
        print("NOW, RUNNING COMMAND -> " + cmd)
        return await self.callSubProcess(cmd)

    async def callDummyDataCollectors(self, dummyCollectors, duration=10):
        async def call(goodJson):
            badJson = json.dumps(goodJson).replace('"', '%%%QUOTATION&&&')
            print("")
            cmd = "python {}MODEL/dummy_collector.py {} --jsonbad '{}'".format(getCurrentWorkingDirectory(), duration, badJson)
            print("NOW, EXECUTING DUMMY DATA COLLECTOR WITH COMMAND -> " + cmd)
            # FIND A WAY TO MAKE THIS FUNCTION DEPLOY DUMMY COLLECTORS SIMULTANEOUSLY (PERHAPS CONSIDER NODEJS) ...
            return await self.callSubProcess(cmd)

        goodJson = {}
        print("")
        for source, files in dummyCollectors.items():
            goodJson[source] = []
            print("")
            print("NOW, EXECUTING DUMMY DATA COLLECTOR FOR SOURCE {} ON {} FOLDER(S)/FILE(S)".format(source,
                                                                                                     len(
                                                                                                         files)))
            for filename, pathFormat in files.items():
                if (filename is not None) and (len(filename) > 0):
                    # THIS HAS TO BE MADE ASYNC, SO 1 FILE DOESN'T WAIT FOR PREVIOUS FILE TO FINISH SETTING UP WITH THE DUMMY COLLECTOR
                    if (filename is "general") and (pathFormat is not None):
                        files = pathFormat["inner-files"].keys()
                        print(
                            "FILENAME IS ACTUALLY A DIRECTORY, THEREFORE CALLING DUMMY COLLECTORS FOR ALL {} FILES WITHIN THIS DIRECTORY".format(len(files)))
                        for filename in files:
                            goodJson[source].append(filename)
                    else:
                        goodJson[source].append(filename)
        await call(goodJson)
        print("")
        return "DONE CALLING DUMMY COLLECTORS"

    async def callSubProcess(self, cmd):
        try:
            cmd = 'node {}MODEL/node_async.js --cmd "{}"'.format(getCurrentWorkingDirectory(), cmd)
            print("COMMAND TO RUN -> {}".format(cmd))
            process = await asyncio.create_subprocess_shell(cmd, stdout=asyncio.subprocess.PIPE)
            print("")
            print('Started: command (pid = ' + str(process.pid) + ')')  # Status
            stdout, stderr = await process.communicate()  # Wait for the subprocess to finish
            success = (process.returncode == 0)
            if success:  # Progress
                print('Done: command (pid = ' + str(process.pid) + ')')
            else:
                print('Failed: command (pid = ' + str(process.pid) + ')')
            result = stdout.decode().strip()
            print(result)

            ''' #   DON'T NEED THIS ANYMORE COZ WE DON'T WANT THIS PROGRAM WAITING FOR DUMMY COLLECTOR TO FINISH EXECUTING BEFORE IT CONTINUES
            # subprocess.call(cmd)

            output, error = subprocess.Popen(cmd.split(" "), stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
            if error is not None:
                print("ERROR -> {}".format(error))
            else:
                print("=============OUTPUT================")
                print(output)
            '''
            return "COMMAND RAN SUCCESSFULLY" if success else "COMMAND COULD NOT BE RUN"
        except Exception as e:
            print(e.message)
            return "COMMAND COULD NOT BE RUN"
