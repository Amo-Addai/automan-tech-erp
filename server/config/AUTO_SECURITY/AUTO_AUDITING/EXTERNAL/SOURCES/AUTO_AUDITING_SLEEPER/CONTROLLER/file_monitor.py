# import sys, subprocess, os, json, time, logging
#
# from watchdog.observers import Observer
# from watchdog.events import LoggingEventHandler
# from watchdog.events import FileSystemEventHandler
#
#
# class AutoParser:
#
#     def __init__(self, autoauditOrActionType, autoauditOrAction, source, filename, pathFormat):
#         self.type = autoauditOrActionType
#         self.autoauditOrAction = autoauditOrAction
#         self.source = source
#         self.filename = filename
#         self.pathFormat = pathFormat
#         self.processedLines = []
#
#     def toString(self):
#         return "{}: '{}' ({}) -> {} : '{}' ({})".format(self.type, self.autoauditOrAction, self.source, self.filename,
#                                                         self.pathFormat["path"], self.pathFormat["format"])
#
#     def processLine(self, line):
#         logging.info("AUTO-PARSER PROCESSING LINE -> " + self.toString())
#         logging.info("LINE -> " + line)
#
#     def processFile(self, path):  # READ THIS FILE BASED ON self.pathFormat["format"]
#         logging.info("AUTO-PARSER PROCESSING FILE -> " + self.toString())
#         logging.info("FILE PATH -> " + path)
#         if self.pathFormat["path"] in path:
#             logging.info("PATH IS VALID WITH THIS AUTO-PARSER OBJECT, THEREFORE NOW PARSING ...")
#             # with open(path, "r") as file:
#             #     logging.info("PATH OF FILE OPENED -> " + path)
#             #     lines = file.readlines()
#             #     linesToProcess = []
#             #     for line in lines:
#             #         if line not in self.processedLines:
#             #             linesToProcess.append(line)
#             #     res = True  # self.autoParsers[self.filename].processLines(linesToProcess)
#             #     if res:
#             #         self.processedLines.append(linesToProcess)
#             #         logging.info("{} LINES PROCESSED SUCCESSFULLY".format(len(self.processedLines)))
#         else:
#             logging.info("PATH IS NOT VALID WITH THIS AUTO-PARSER OBJECT")
#             return None
#
#
# class CustomFileSystemEventHandler(FileSystemEventHandler):
#     def __init__(self, autoauditOrActionType, autoauditOrAction, source, filename, pathFormat):
#         self.type = autoauditOrActionType
#         self.autoauditOrAction = autoauditOrAction
#         self.source = source
#         self.filename = filename
#         self.pathFormat = pathFormat
#         # NOW, SETUP THIS CLASS' AutoParser OBJECT PROPERTY
#         self.autoParsers = {}
#         if self.filename is "general":  # or (self.pathFormat["format"] is "folder"):
#             print("THIS IS A GENERAL EVENT HANDLER, THEREFORE CREATING MULTIPLE AUTO-PARSERS ...")
#             innerFiles = self.pathFormat["inner-files"]
#             for filename, pathFormat in innerFiles.items():  # IMPLEMENT FILE-MONITORING FUNCTIONALITY RIGHT HERE :)
#                 if (filename is not None) and (len(filename) > 0):
#                     print("ADDING AUTO-PARSER FOR FILE -> " + filename)
#                     self.autoParsers[filename] = AutoParser(self.type, self.autoauditOrAction, self.source, filename,
#                                                             pathFormat)
#         else:
#             print("THIS IS A SPECIFIC EVENT HANDLER, THEREFORE CREATING JUST A SPECIFIC AUTO-PARSER ...")
#             self.autoParsers[self.filename] = AutoParser(self.type, self.autoauditOrAction, self.source, self.filename,
#                                                          self.pathFormat)
#         print("NUMBER OF AUTO-PARSERS -> {}".format(len(self.autoParsers)))
#
#     def toString(self):
#         return "{}: '{}' ({}) -> {} : '{}' ({})".format(self.type, self.autoauditOrAction, self.source, self.filename,
#                                                         self.pathFormat["path"], self.pathFormat["format"])
#
#     def getFilename(self, path):
#         try:
#             logging.info("GETTING FILENAME USING PATH -> " + path)
#             # DON'T USE THIS COMMENTED PART OF THIS IF-STATEMENT COZ NOT ALL LOG FILES END WITH ".log"
#             # and (self.filename.endswith(".log")):  #   <=== THIS CODE IS WHAT YOU SHOULDN'T USE ANYMORE ...
#             if (self.filename is not "general") and (self.filename in path) and (path.endswith(self.filename)):
#                 logging.info("THIS FILENAME/PATH IS AN ACTUAL PATH TO FILE, NOT A FOLDER")
#                 return self.filename
#             elif (self.filename is "general") and ("inner-files" in self.pathFormat) \
#                     and type((self.pathFormat["inner-files"]) is dict):  # CHECK IF IT'S A DICTIONARY
#                 logging.info("THIS FILENAME/PATH IS A FOLDER, THEREFORE LOOPING THROUGH THE POSSIBLE FILES ...")
#                 for key, value in self.pathFormat["inner-files"].items():
#                     logging.info("CHECKING FOR FILE -> " + key + " WITH PATH -> " + path)
#                     if (key in path) and (path.endswith(key)) and ("path" in value) and ("format" in value) \
#                             and (key in self.pathFormat["inner-files"]):  # THOUGH FILE IS WITHIN THIS "general" FOLDER
#                         # DO THIS IN CASE THIS FILENAME key IS NOT INCLUDED WITHIN FILES TO MONITOR FOR THIS AUDIT
#                         return key
#         except:
#             logging.info("ERROR IN RETRIEVING FILENAME")
#         return None
#
#     def processFile(self, path):
#         logging.info("PROCESSING (LOG) FILE -> " + path)
#         if self.filename is "general":
#             logging.info("PATH IS THE " + self.filename + " DIRECTORY PATH")
#         elif self.filename not in path:  # DO THIS FIRST, BEFORE MOVING ON TO VALIDATION OF THE path
#             path += self.filename
#             logging.info("PATH WAS FOR DIRECTORY, THEREFORE FILENAME APPENDED -> " + path)
#         else:
#             logging.info("PATH ALREADY INCLUDES FILENAME -> " + self.filename)
#         if (self.filename is "general") or ((self.filename in path) and (self.source in path)):
#             logging.info(
#                 "PATH INDEED INCLUDES THIS INSTANCE'S SOURCE AND FILENAME -> {}/{}".format(self.source, self.filename))
#             try:
#                 if os.path.exists(path) and os.path.isfile(path):
#                     # GET STRING FROM LAST INDEX OF path TO END OF STRING TO GET THE ACTUAL FILENAME
#                     filename = self.getFilename(path)
#                     logging.info("FILENAME -> " + (filename if (filename is not None) else "-"))
#                     if filename is not None:
#                         self.autoParsers[filename].processFile(path)
#                     else:
#                         logging.info("SORRY AUTO-PARSER CANNOT PROCESS THIS FILE")
#                 else:
#                     logging.info("PATH IS NOT A FILE, OR DOES NOT EXIST -> " + path)
#             except Exception as e:
#                 logging.info("SOME ERROR OCCURED DURING READING OF PATH -> " + path)
#         else:
#             logging.info("PATH NOT VALID")
#
#     def process(self, event):
#         """
#         event.event_type : modified/created/moved/deleted
#         event.is_directory : Boolean
#         event.src_path : file/dir path
#         """
#         logging.info("")
#         logging.info("")
#         logging.info("FILE MONITORING WORKS --->>> '{}' '{}'".format(event.event_type, event.src_path))
#         if event.is_directory:
#             return
#         logging.info("EVENT HAS TO DO WITH A FILE, NOT A FOLDER ....")
#         if event.event_type == 'modified':
#             logging.info("THIS WAS A 'modified' EVENT, THEREFORE PROCESSING (LOG) FILE")
#             self.processFile(event.src_path)
#         else:
#             logging.info("THIS WAS NOT A 'modified' EVENT, THEREFORE NOT PROCESSING (LOG) FILE")
#
#     # def on_any_event(self, event):
#     #     super(CustomFileSystemEventHandler, self).on_any_event(event)
#     #     self.process(event)
#
#     def on_modified(self, event):
#         super(CustomFileSystemEventHandler, self).on_modified(event)
#         self.process(event)
#
#     def on_created(self, event):
#         super(CustomFileSystemEventHandler, self).on_created(event)
#         self.process(event)
#
#     def on_deleted(self, event):
#         super(CustomFileSystemEventHandler, self).on_deleted(event)
#         self.process(event)
#
#     def on_moved(self, event):
#         super(CustomFileSystemEventHandler, self).on_moved(event)
#         self.process(event)
#
#
# def main():  # GET CLI ARGUMENTS, THEN BEGIN SEEDING THE DUMMY DATA TO CORRESPONDING LOG FILE
#     print("")
#     print("FILE MONITOR RUNNING NOW ...")
#     print("ARGUMENTS -> {}".format(sys.argv))
#     try:
#         autoauditOrActionType, autoauditOrAction, source, filename, path, fmt = sys.argv[1], sys.argv[2], sys.argv[3], \
#                                                                                 sys.argv[4], sys.argv[5], sys.argv[6]
#         pathFormat = {'path': path, 'format': fmt}
#         if True:  # SAMPLE VALIDATION: (filename is not None) and (len(filename) > 0) and (source is not None) and (len(source) > 0):
#             print("FILE -> " + source + "/" + filename)
#             path = sys.argv[1] if len(sys.argv) > 1 else '.'
#             # DO THIS SO YOUR EVENT HANDLER CLASS CAN LOG TO CONSOLE WHILE MONITORING FILE SYSTEM ...
#             logging.basicConfig(level=logging.INFO,
#                                 format='%(asctime)s - %(message)s',
#                                 datefmt='%Y-%m-%d %H:%M:%S')
#             event_handler = CustomFileSystemEventHandler(autoauditOrActionType, autoauditOrAction, source, filename,
#                                                          pathFormat)
#             print("EVENT HANDLER OBJECT CREATED FOR THIS FILE, PROCESSING FILE FIRST ...")
#             print(event_handler.toString())
#             event_handler.processFile(event_handler.pathFormat["path"])
#             print("NOW, SETTING UP OBSERVER FOR THIS FILE WITH EVENT HANDLER OBJECT")
#             observer = Observer()
#             observer.schedule(event_handler, path=event_handler.pathFormat["path"], recursive=True)
#             observer.start()
#             try:
#                 while True:
#                     time.sleep(1)
#             except KeyboardInterrupt:
#                 observer.stop()
#             observer.join()
#         else:
#             print("SORRY, CANNOT RUN FILE MONITOR")
#     except Exception as e:
#         print("ERROR")
#         print(e)
#
#
# if __name__ == '__main__':
#     main()
