import pandas as pd
import numpy as np
import re, os, time, json
import logging

from CONTROLLER.AccessAutomanAPI import AccessAutomanAPI

#    THIS CANNOT BE IMPORTED COZ IT CAUSES A CYCLIC DEPENDENCY :(
# from AutoAuditingSleeperApp import getApp

'''
THIS CLASS IS MAINLY USED TO PARSE LOG DATA BASED ON AUTO-AUDIT OR SOURCES/TOOLS INTO A PREFERRED FORMAT (JSON)
THEN RETURNS DATA BACK TO AutoAuditingSleeperApp.py TO BE SENT TO Auto-API
'''
file_headers = {
    "Bro": {
        "conn.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                     "proto", "service", "duration", "orig_bytes", "resp_bytes", "conn_state",
                     # ALL OTHER DATA IS KINDA USELESS,
                     "local_orig", "local_resp", "missed_bytes", "history", "orig_pkts", "resp_pkts",
                     "resp_ip_bytes", "tunnel_parents", "orig_l2_addr", "resp_l2_addr", "vlan", "inner_vlan"],
        ############################################################################################################
        "http.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                     "trans_depth", "method", "host", "uri", "referrer", "version", "user_agent", "request_body_len",
                     "response_body_len", "status_code", "status_msg",
                     # ALL OTHER DATA IS KINDA USELESS,
                     "info_code", "info_msg", "tags", "username", "password", "capture_password", "proxied",
                     "range_request", "orig_fuids",
                     "orig_filenames", "orig_mime_types", "resp_fuids", "resp_filenames", "resp_mime_types",
                     "current_entity", "orig_mime_depth",
                     "resp_mime_depth", "client_header_names", "server_header_names", "omniture", "flash_version",
                     "cookie_vars", "uri_vars"],
        ############################################################################################################
        "ssh.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                    "version", "auth_success", "auth_attempts", "direction", "client", "server", "cipher_alg",
                    "mac_alg",
                    "compression_alg", "kex_alg", "host_key_alg", "host_key"],
        ############################################################################################################
        "ftp.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                    "user", "password", "command", "arg", "mime_type", "file_size", "reply_code", "reply_msg",
                    "data_channel",
                    "cwd", "cmdarg", "pending_commands", "passive", "capture_password", "fuid", "last_auth_requested"],
        ############################################################################################################
        "smtp.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                     "trans_depth", "helo", "mailfrom", "rcptto", "date", "from", "to", "cc"
                                                                                        "reply_to", "msg_id",
                     "in_reply_to", "subject",
                     # ALL OTHER DATA IS KINDA USELESS,
                     "x_originating_ip", "first_received", "second_received", "last_reply", "path", "user_agent", "tls",
                     "process_received_from", "has_client_activity", "entity", "fuids", "is_webmail"],
        ############################################################################################################
        "ssl.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                    "version_num", "version", "cipher", "curve", "server_name", "session_id", "resumed",
                    # ALL OTHER DATA IS KINDA USELESS,
                    "client_ticket_empty_session_seen", "client_key_exchange_seen", "server_appdata",
                    "client_appdata", "last_alert", "next_protocol", "analyzer_id", "established", "logged"],
        ############################################################################################################
        "dhcp.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                     "mac", "assigned_ip", "lease_time", "trans_id"],
        ############################################################################################################
        "dns.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                    "proto", "trans_id", "rtt", "query", "qclass", "qclass_name", "qtype", "qtype_name", "rcode",
                    "rcode_name",
                    # ALL OTHER DATA IS KINDA USELESS,
                    "AA", "TC", "RD", "RA", "Z", "answers", "TTLs", "rejected", "total_answers", "total_replies",
                    "saw_query", "saw_reply", "auth", "addl"],
        ############################################################################################################
        "files.log": ["ts", "fuid", "tx_hosts", "rx_hosts", "conn_uids", "source", "depth", "analyzers", "mime_type",
                      "filename",
                      "duration", "local_orig", "is_orig", "seen_bytes", "total_bytes", "missing_bytes",
                      "overflow_bytes", "timedout",
                      # ALL OTHER DATA IS KINDA USELESS,
                      "parent_fuid", "md5", "sha1", "sha256", "x509", "extracted", "extracted_cutoff", "extracted_size",
                      "entropy"],
        ############################################################################################################
        "notice.log": ["ts", "uid", "id.orig_h", "id.orig_p", "id.resp_h", "id.resp_p",
                       "conn", "iconn", "f",
                       # "fuid", "file_mime_type", "file_desc",  # DON'T NEED THIS ANYMORE, BASED ON THE notice.log FILE
                       "proto", "note", "msg", "sub_msg",
                       "src_addr", "dst_addr", "p-port", "n-status_code", "src_peer", "peer_descr",
                       "actions", "email_body_sections", "identifier", "suppress_for", "dropped", "remote_location"],
        ############################################################################################################
        "signatures.log": ["ts", "uid", "src_addr", "src_port", "dst_addr", "dst_port",
                           "note", "sig_id", "event_msg", "sub_msg", "sig_count", "host_count"],
    },
    "Snort": {
        "alert.fast": ["line"],
        "alert.full": ["line"],
    },
    "Ossec": {

    },
    "Kismet": {

    },
    "Lynis": {

    },
    "Nikto": {  # IF "type", "method", "url" ARE ALL EMPTY, THEN THIS IS JUST A HOST DESCRIPTION (host_name description)
        "-csv": ["host_name", "ip_addr", "port", "osvdbid", "method", "uri", "description"],
        "-xml": ["host_name", "ip_addr", "port", "osvdbid", "method", "uri", "description"],
    },  # -xml FILE HAS MORE INFO THAN DOES -csv DOE ..
}


def getFileHeaders(source, filename, rename=True):
    columns, i = {}, 0
    if source == "Nikto":
        logging.info("SOURCE IS NIKTO!!")
        if ("-csv" in filename) and ("-xml" not in filename):
            filename = "-csv"
        elif ("-xml" in filename) and ("-csv" not in filename):
            filename = "-xml"
        else:
            logging.info("SOME ERROR OCCURRED WITH NIKTO FILE MONITORING")
            exit(0)
        logging.info("FILENAME FOR SETTING UP AUTO-PARSER FOR NIKTO -> {}".format(filename))
    for header in file_headers[source][filename]:
        columns[i] = header
        i += 1
    return columns if (rename) else (file_headers[source][filename])


class AutoParserTester:
    def __init__(self):
        pass


class AutoParser:
    def __init__(self, autoauditOrActionType, autoauditOrAction, source, filename, pathFormat, params):
        self.params = params
        self.server = AccessAutomanAPI(params["url"], params["access_token"])
        #
        self.type = autoauditOrActionType
        self.autoauditOrAction = autoauditOrAction
        self.source = source
        self.filename = filename
        self.pathFormat = pathFormat
        self.preProcessedEntries = None
        self.resetProcessedEntries()

        # ALSO, SETUP THE AUTO-PARSER-TESTER OBJECT IN CASE THIS PARSER MIGHT NEED TO TEST ENTRIES FOR AUTOEVENTS
        # BEFORE THE AUTOEVENTS ARE SENT TO THE AUTO-API STRAIGHT AWAY
        self.autoParserTester = AutoParserTester()

    def __del__(self):
        logging.info("RUNNING DEINITIALIZER FOR AUTO-PARSER FOR FILE '{}/{}'".format(self.source, self.filename))
        self.saveProcessedEntries()

    def saveProcessedEntries(self):
        try:
            if len(self.preProcessedEntries) > 0:
                newPreProcessedEntries = self.preProcessedEntries.fillna("None")
                path = self.pathFormat["path"].replace("LOG_FILES", "PROCESSED_LOG_FILES")
                # logging.info("PATH OF PREPROCESSED LOG FILE -> {}".format(path))
                if os.path.exists(path) and os.path.isfile(path):
                    try:
                        oldPreProcessedEntries = pd.read_json(path).fillna("None")
                        if oldPreProcessedEntries is not None:
                            # logging.info("OLD PREPROCESSED ENTRIES")
                            # logging.info(oldPreProcessedEntries)
                            newPreProcessedEntries = pd.concat([oldPreProcessedEntries, newPreProcessedEntries],
                                                               ignore_index=True)
                        else:
                            raise Exception
                    except Exception as e:
                        logging.info("ERROR OCCURED WHILE READING PROCESSED FILE")
                        logging.info(e)
                else:
                    logging.info("SORRY, THIS FILE DOESN'T EXIST, CREATING A NEW ONE ...")
                    # f = open(path, "w+")
                    # f.close()
                newPreProcessedEntries.reset_index(inplace=True, drop=True)
                # logging.info("NEW PREPROCESSED ENTRIES")
                # logging.info(newPreProcessedEntries)
                # NOW, WRITE/SAVE TO PROCESSED FILE ..
                newPreProcessedEntries.to_json(path)
                self.resetProcessedEntries()
            else:
                logging.info("NO NEW PREPROCESSED ENTRIES TO BE SAVED ...")
            return True
        except Exception as e:
            logging.info("ERROR OCCURED DURING SAVING OF PREPROCESSED ENTRIES")
            logging.info(e)
        return False

    def resetProcessedEntries(self):
        try:
            # logging.info("NOW, RESETTING A NEW PREPROCESSED ENTRIES DATAFRAME")
            self.columns = getFileHeaders(self.source, self.filename, rename=False)
            self.renameColumns = getFileHeaders(self.source, self.filename)
            # logging.info("COLUMNS -> {}".format(self.columns))
            # logging.info("RENAME COLUMNS -> {}".format(self.renameColumns))
            self.preProcessedEntries = None
            self.preProcessedEntries = pd.DataFrame(columns=self.columns)
            #
            path = self.pathFormat["path"].replace("LOG_FILES", "PROCESSED_LOG_FILES")
            # logging.info("PATH OF PREPROCESSED LOG FILE -> {}".format(path))
            if os.path.exists(path) and os.path.isfile(path):
                try:
                    self.preProcessedEntries = pd.read_json(path)
                except Exception as e:
                    logging.info("ERROR OCCURED WHILE READING PROCESSED FILE")
                    logging.info(e)
            else:
                logging.info("SORRY, THIS FILE DOESN'T EXIST, CREATING A NEW ONE ...")
                # f = open(path, "w+")
                # f.close()
        except Exception as e:
            logging.info("ERROR OCCURED WHILE RETRIEVING PREPROCESSED ENTRIES FILE ..")
            logging.info(e)
        # logging.info("RENEWED PREPROCESSED ENTRIES DATAFRAME")
        # logging.info(self.preProcessedEntries)

    def toString(self):
        return "{}: '{}' ({}) -> {} : '{}' ({})".format(self.type, self.autoauditOrAction, self.source, self.filename,
                                                        self.pathFormat["path"], self.pathFormat["format"])

    def getAutoAudit(self):  # IF THIS WAS NOT A CLEAR AUTO-AUDIT, BUT AN ACTION, FIND IT'S CORRESPONDING AUTO-AUDIT
        if self.type == "autoaudit":
            return self.autoauditOrAction
        elif self.type == "action":
            return ""  # JUST RETURN THIS FOR NOW, AND EDIT THIS WHEN YOU START HANDLING EVENTS

    def sendAutoAudits(self, entriesToSend):  # USE self.server TO ACCESS AUTO-API
        logging.info("SENDING AUTO-AUDIT DATA TO AUTO-API ...")
        logging.info("{}".format(entriesToSend))
        autoaudit = self.getAutoAudit()
        logging.info(
            "{}: SENDING AUTOEVENTS FIRST, COZ THEY'RE MORE IMPORTANT, BEFORE SENDING AUTOLOGS".format(autoaudit))
        res = {
            "autoevents": True,
            "autologs": True,
        }
        if len(entriesToSend["autoevents"]) > 0:
            logging.info("SENDING AUTOEVENTS ...")
            res["autoevents"] = self.server.sendAutoEvents(self.source, autoaudit, entriesToSend["autoevents"])
        if len(entriesToSend["autologs"]) > 0:
            logging.info("NOW, SENDING AUTOLOGS ...")
            res["autologs"] = self.server.sendAutoLogs(self.source, autoaudit, entriesToSend["autologs"])
        for k, r in res.items():
            logging.info("{}: {}".format(k, r))
        return res

    def getValue(self, value):  # PERFORM SOME VALIDATIONS ON VALUE IN CASE OF UNWANTED VALUES
        if (pd.isna(value)) or (value is None) or (value == "-"):
            return "-"
        if type(value) == str:
            if "\\x" in value:
                value.replace("\\x", "")
                return value
            elif len(value) == 0:
                return "-"
        elif (type(value) == int) or (type(value) == float):
            pass
        elif type(value) == bool:
            pass
        return value

    def preProcessEntry(self, index, entry):  # entry MUST BE A SERIES
        # PRE-PROCESS entry BASED ON  SOURCE, FILE, ETC INTO ITS CORRESPONDING JSON FORMAT FOR AUTO-API
        # logging.info("NOW PROCESSING ENTRY -> {}".format(entry))
        # logging.info("AUTO-PARSER -> {}".format(self.toString()))
        preprocessed, logOrEvent, data = False, None, None
        # KNOW WHAT TO DO IF YOU'RE PREPROCESSING AN AUTOAUDIT DATA OBJECT TO SEND AS AN AUTOLOG
        # ALSO KNOW WHAT TO DO IF YOU'RE PREPROCESSING AN AUTOEVENT DATA OBJECT TO SEND IT STRAIGHT AWAY ...
        ##################################################################################################################
        try:
            if self.autoauditOrAction == "Network Connection Tracking":  # HANDLE ALL POSSIBLE SOURCES FOR THIS AUTOAUDIT
                if self.source == "Bro":
                    """
                    # YOU CAN ALSO PREPROCESS THIS ENTRY TO FORM AN AUTOEVENT, eg. "Network Multiple Connections"
                    # USE THIS IF YOU PREFER TO SEND AN AUTOEVENT STRAIGHT AWAY ...
                    data = {
                        "connections": [{
                            "_id": self.getValue(entry["uid"]),
                            "orig_endpoint": {
                                "address": self.getValue(entry["id.orig_h"]),
                                "port": self.getValue(entry["id.orig_p"])
                            },
                            "resp_endpoint": {
                                "address": self.getValue(entry["id.resp_h"]),
                                "port": self.getValue(entry["id.resp_p"])
                            }
                        }],  # ts COLUMN MIGHT BE MESSED UP, SO YOU CAN AUTO-GENERATE THE CURRENT TIMESTAMP
                        "timestamps": [self.getValue(entry["ts"])],
                        "sources": {
                            "Bro": {}
                        }
                    }
                    
                        # data["protocols"] = [self.getValue(entry["service"])]
                        # data["sources"]["Bro"]["conn_states"] = [self.getValue(entry["conn_state"])]
                        
                        # data["protocols"] = self.filename
                        # data["protocols"] = data["protocols"].replace(".log", "")
                        # data["protocols"] = [data["protocols"]]
                        
                        # logOrEvent = "autoevent"
                            
                        # data = {
                        #     "body": data,
                        #     "extra": {
                        #         "autoevent": "Network Multiple Connections",
                        #         "emergency_level": "default",
                        #     },
                        # }
                    """
                    data = {
                        "connection": {
                            "_id": self.getValue(entry["uid"]),
                            "orig_endpoint": {
                                "address": self.getValue(entry["id.orig_h"]),
                                "port": self.getValue(entry["id.orig_p"])
                            },
                            "resp_endpoint": {
                                "address": self.getValue(entry["id.resp_h"]),
                                "port": self.getValue(entry["id.resp_p"])
                            }
                        },
                        "timestamp": self.getValue(entry["ts"]),
                        "sources": {
                            "Bro": {}
                        }
                    }
                    logging.info("PRE DATA -> {}".format(data))
                    if self.filename == "conn.log":
                        logging.info("CONN.LOG")
                        data["protocol"] = self.getValue(entry["service"])
                        data["sources"]["Bro"]["conn_state"] = self.getValue(entry["conn_state"])
                    elif self.filename in ["http.log", "ssh.log", "ftp.log", "smtp.log"]:
                        logging.info("EXTRA.LOG -> {}".format(self.filename))
                        data["protocol"] = self.filename
                        data["protocol"] = data["protocol"].replace(".log", "")
                    logOrEvent = "autolog"
                    preprocessed = True
                elif self.source == "Kismet":  # HANDLE ALL POSSIBLE LOG FILES FOR KISMET WIDS
                    pass
            ##################################################################################################################
            elif self.autoauditOrAction == "Intrusion Detection":  # HANDLE ALL POSSIBLE SOURCES FOR THIS AUTOAUDIT
                if self.source == "Bro":
                    # TYPE OF NOTICES / INTRUSIONS
                    possibleAutoEvents = ["TeamCymruMalwareHashRegistry::Match", "Software::Vulnerable_Version",
                                          "Traceroute::Detected", "Scan::Address_Scan",
                                          "Scan::Port_Scan", "DNS::External_Name", "FTP::Bruteforcing",
                                          "HTTP::SQL_Injection_Attacker", "HTTP::SQL_Injection_Victim",
                                          "SMTP::Blocklist_Error_Message", "SMTP::Blocklist_Blocked_Host",
                                          "SMTP::Suspicious_Origination", "SSH::Password_Guessing",
                                          "SSH::Login_By_Password_Guesser", "SSH::Watched_Country_Login",
                                          "SSH::Interesting_Hostname_Login", "Heartbleed::SSL_Heartbeat_Attack",
                                          "Heartbleed::SSL_Heartbeat_Attack_Success",
                                          "Heartbleed::SSL_Heartbeat_Odd_Length",
                                          "Heartbleed::SSL_Heartbeat_Many_Requests",
                                          "SSL::Weak_Key", "SSL::Weak_Cipher", "SSL::Old_Version"]
                    # logging.info("BRO NETWORK INTRUSION DETECTION WITH POSSIBLE AUTOEVENTS -> {}".format(possibleAutoEvents))
                    # logging.info("ENTRY -> {}".format(entry))
                    data = {
                        "connection": {
                            "_id": self.getValue(entry["uid"]),
                            "orig_endpoint": {
                                "address": self.getValue(entry["id.orig_h"]),
                                "port": self.getValue(entry["id.orig_p"])
                            },
                            "resp_endpoint": {
                                "address": self.getValue(entry["id.resp_h"]),
                                "port": self.getValue(entry["id.resp_p"])
                            }
                        },
                        "timestamp": self.getValue(entry["ts"]),
                        "ids": "Network",
                        "protocol": self.getValue(entry["proto"]),
                        "sources": {
                            "Bro": {
                                "notice": {
                                    "type": self.getValue(entry["note"]),
                                    "message": self.getValue(entry["msg"]),
                                    "sub_message": self.getValue(entry["sub_msg"])
                                },
                                "detection_connection": {
                                    "src_addr": self.getValue(entry["src_addr"]),
                                    "dst_addr": self.getValue(entry["dst_addr"]),
                                    "port": self.getValue(entry["p-port"]),
                                    "status_code": self.getValue(entry["n-status_code"])
                                },
                                "peer": {
                                    "source": self.getValue(entry["src_peer"]),
                                    "description": self.getValue(entry["peer_descr"])
                                }
                            }
                        }
                    }
                    logging.info("PRE DATA -> {}".format(data))
                    logOrEvent, noticeType = "autolog", data["sources"]["Bro"]["notice"]["type"]
                    if noticeType in possibleAutoEvents:
                        logging.info("THIS ENTRY IS AN 'Intrusion Detected' AUTOEVENT - {}".format(noticeType))
                        logOrEvent = "autoevent"
                        data = {
                            "body": data,
                            "extra": {
                                "autoevent": "Intrusion Detected",
                                "emergency_level": "default",
                            },
                        }
                    preprocessed = True
                elif self.source == "Snort":
                    # TYPE OF NOTICES / INTRUSIONS
                    possibleAutoEvents = []
                    logging.info(
                        "SNORT NETWORK INTRUSION DETECTION WITH POSSIBLE AUTOEVENTS -> {}".format(possibleAutoEvents))
                    logging.info("")
                    snortLine = entry["line"]
                    logging.info("SNORT LINE -> {}".format(snortLine))
                    #
                    protocol, alert = "TCP", {"type": "", "message": "", "priority": ""}
                    matches = re.match(
                        r'^((?:[0-9]{2}[-\/:.]){5}[0-9]{6}).*[{]TCP[}]\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))\s*->\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))',
                        snortLine)
                    if matches is None:  # PUT THIS IN SOME KINDA LOOP (INPUT PROTOCOL IN REGEX GENERICALLY :)
                        protocol = "UDP"
                        logging.info("NO MATCH, TRYING UDP REGEX")
                        matches = re.match(
                            r'^((?:[0-9]{2}[-\/:.]){5}[0-9]{6}).*[{]UDP[}]\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))\s*->\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))',
                            snortLine)
                        if matches is None:
                            protocol = "ICMP"
                            logging.info("NO MATCH, TRYING ICMP REGEX")
                            matches = re.match(
                                r'^((?:[0-9]{2}[-\/:.]){5}[0-9]{6}).*[{]ICMP[}]\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))\s*->\s*(((?:[0-9]{1,3}[.]){1,3}[0-9]{1,3}):([0-9]{1,6}))',
                                snortLine)
                    #
                    # logging.info("MATCHES -> {}".format(matches))
                    extra, timestamp, srcip, srcport, respip, respport = matches.group(0), matches.group(
                        1), matches.group(3), \
                                                                         matches.group(4), matches.group(
                        6), matches.group(7)
                    srcipport, respipport = matches.group(2), matches.group(5)
                    for substr in [timestamp, srcipport, respipport, protocol]:
                        extra = extra.replace(substr, "")
                    # NOW, PARSE extra AGAIN TO RETRIEVE OTHER NECESSARY DATA : alert (priority, classification, message)
                    extra = extra.replace("] {}  -> ", "")
                    logging.info("EXTRA -> {}".format(extra))
                    _, msg, classification, prior = extra.split("] [")
                    alert["priority"] = prior.replace("Priority: ", "")
                    alert["type"] = classification.replace("Classification: ", "")
                    msg = msg.replace(" [**", "")
                    findOutWhatToUseThisFor, alert["message"] = msg.split("] ")
                    #
                    data = {
                        "connection": {
                            "_id": "",
                            "orig_endpoint": {
                                "address": srcip,
                                "port": srcport
                            },
                            "resp_endpoint": {
                                "address": respip,
                                "port": respport
                            }
                        },
                        "timestamp": timestamp,
                        "ids": "Network",
                        "protocol": protocol,
                        "sources": {
                            "Snort": {
                                "alert": {
                                    "type": alert["type"],
                                    "message": alert["message"],
                                    "priority": alert["priority"]
                                },
                            }
                        }
                    }
                    logging.info("PRE DATA -> {}".format(data))
                    logOrEvent, noticeType = "autolog", data["sources"]["Snort"]["alert"]["type"]
                    if True:  # noticeType in possibleAutoEvents:
                        logging.info("THIS ENTRY IS AN 'Intrusion Detected' AUTOEVENT - {}".format(noticeType))
                        logOrEvent = "autoevent"
                        data = {
                            "body": data,
                            "extra": {
                                "autoevent": "Intrusion Detected",
                                "emergency_level": "default",
                            },
                        }
                    preprocessed = True
                elif self.source == "Ossec":
                    pass
                elif self.source == "Kismet":
                    pass
            ##################################################################################################################
            elif self.autoauditOrAction == "Vulnerability Scanning":  # HANDLE ALL POSSIBLE SOURCES FOR THIS AUTOAUDIT
                if self.source == "Nikto":
                    # "-csv": ["host_name", "ip_addr", "port", "osvdbid", "method", "uri", "description"],
                    data = {
                        "host": {
                            "host_name": self.getValue(entry["host_name"]),
                            "ip_addr": self.getValue(entry["ip_addr"]),
                            "port": self.getValue(entry["port"]),
                        },
                        "description": self.getValue(entry["description"]),
                        "timestamp": time.time(),  # GET CURRENT TIMESTAMP :)
                        "sources": {
                            "Nikto": {
                                "osvdbid": self.getValue(entry["osvdbid"]),
                                "method": self.getValue(entry["method"]),
                                "uri": self.getValue(entry["uri"]),
                            }
                        }
                    }
                    logging.info("PRE DATA -> {}".format(data))
                    logOrEvent, NiktoData = "autolog", data["sources"]["Nikto"]
                    for key in ["osvdbid", "method", "uri"]:
                        if (key in NiktoData) and (type(NiktoData[key]) is str) \
                                and (len(NiktoData[key]) > 1) and (NiktoData[key] != "-"):
                            logging.info(
                                "THIS ENTRY IS A 'Vulnerability Detected' AUTOEVENT - {}".format(data["description"]))
                            logOrEvent = "autoevent"
                            data = {
                                "body": data,
                                "extra": {
                                    "autoevent": "Vulnerability Detected",
                                    "emergency_level": "default",
                                },
                            }
                            break
                    preprocessed = True
            elif self.autoauditOrAction == "System Auditing":
                if self.source == "Lynis":
                    pass
            else:
                pass
        except Exception as e:
            logging.info("ERROR OCCURED DURING PROCESSING OF ENTRY ...")
            logging.info(e)
        ##################################################################################################################
        # NOW, CHECK WHETHER THIS ENTRY WAS INDEED preprocessed :)
        if (preprocessed) and (logOrEvent is not None) and (data is not None):
            logging.info("PREPROCESSED '{}' DATA -> {}".format(logOrEvent, data))
            return logOrEvent, data
        else:
            logging.info("SORRY, COULD NOT PREPROCESS THIS ENTRY")
            return None, None

    def getUnprocessedEntries(self, entries):  # entries MUST BE A DATAFRAME

        def entriesAreEqual(x, y):
            try:
                # logging.info("CHECKING IF ENTRIES ARE EQUAL ...")
                x, y = x.fillna("None"), y.fillna("None")
                if x.equals(y):  # DOES NOT WORK WHEN DATAFRAME HAS MULTIPLE COLUMNS (COZ THEY MIX UP)
                    logging.info("ENTRIES ARE EQUAL STRAIGHT AWAY!!")
                    return True
                else:  # LOOP THROUGH ALL COLUMNS AND VALIDATE THEIR VALUES IN BOTH ENTRIES
                    # logging.info("ENTRIES NOT EQUAL STRAIGHT AWAY, THEREFORE CHECKING THE COLUMNS")
                    columns = list(entries.columns.values)
                    # logging.info("COLUMNS -> {}".format(columns))
                    if False:  # columns : FIND OUT IF columns IS CONTAINED BY BOTH x & y SERIES OBJECTS ..
                        # logging.info("UNEQUAL COLUMN NAMES")
                        return False
                    else:
                        for col in columns:
                            # logging.info("COLUMN -> {} : {} | {}".format(col, x[col], y[col]))
                            if x[col] != y[col]:
                                # logging.info("RETURN FALSE (UNEQUAL) ...")
                                return False
                        return True
            except Exception as e:
                logging.info(e)
                return False

        def isPreProcessed(entry):
            # logging.info("ENTRY -> {}".format(entry))
            for i, processedEntry in self.preProcessedEntries.iterrows():
                # logging.info("PROCESSED ENTRY -> {}".format(processedEntry))
                if entriesAreEqual(entry, processedEntry):
                    return True
            return False

        try:
            # SLICE ALL entries WHICH HAVE ALREADY BEEN PRE-PROCESSED (WITHIN self.preProcessedEntries)
            logging.info("{} ENTRIES".format(len(entries)))
            logging.info("")
            logging.info("RESETTING INDEXES WITHIN ALL ENTRIES NOW ..")
            logging.info("")
            entries.reset_index(inplace=True, drop=True)

            for i, entry in entries.iterrows():
                if isPreProcessed(entry):
                    logging.info("THIS ENTRY HAS ALREADY BEEN PROCESSED DROPPING ENTRY: {} -> {}".format(i, entry))
                    entries = entries.drop([i])  # DROP entry AT INDEX i
                    logging.info("{} ENTRIES LEFT NOW ...".format(len(entries)))
            logging.info("")
            logging.info("RESETTING INDEXES WITHIN UNPROCESSED ENTRIES NOW ..")
            logging.info("")
            entries.reset_index(inplace=True, drop=True)
        except Exception as e:
            logging.info("ERROR OCCURED WHILE RETRIEVING UNPROCESSED ENTRIES")
            logging.info(e)
            logging.info("RETURNING THE SAME ENTRIES")
        return entries

    def preProcessEntries(self, entries):
        if entries is not None:  # NOW WORK WITH entries HOWEVER YOU SEE FIT ...
            entries = self.getUnprocessedEntries(entries)
            logging.info("{} UNPROCESSED ENTRIES".format(len(entries)))
            # logging.info(entries)
            # logging.info("BEFORE PREPROCESSING ...")
            # logging.info(self.preProcessedEntries)
            entriesToSend, entriesToAppend = {  # ARRAY OF JSON OBJECTS (AUTOLOGS & AUTOEVENTS)
                                                 "autologs": [],
                                                 "autoevents": []
                                             }, {  # PANDAS DATAFRAME OF SERIES OBJECTS (ROWS)
                                                 "autologs": pd.DataFrame(columns=self.columns),
                                                 "autoevents": pd.DataFrame(columns=self.columns)
                                             }
            for i, entry in entries.iterrows():
                logOrEvent, data = self.preProcessEntry(i, entry)
                if (logOrEvent is not None) and ((logOrEvent + "s") in entriesToSend) and (data is not None):
                    logging.info("APPENDING {}".format(logOrEvent))
                    entriesToSend[logOrEvent + "s"].append(data)  # APPEND THE JSON DATA
                    entriesToAppend[logOrEvent + "s"] = entriesToAppend[logOrEvent + "s"].append(
                        entry)  # APPEND THE PANDAS SERIES OBJECT (ROW)
            result = self.sendAutoAudits(entriesToSend)
            if result is not None:
                logging.info("SAVING ALL (PREPROCESSED OR NOT) ENTRIES (AUTOLOGS & AUTOEVENTS)")
                logging.info(result)
                for sth in ["autologs", "autoevents"]:
                    logging.info(
                        "{}:{} {} -> ENTRIES TO SEND:APPEND".format(len(entriesToSend[sth]), len(entriesToAppend[sth]),
                                                                    sth))
                    if (sth in result) and (result[sth]) and \
                            (sth in entriesToSend) and (sth in entriesToAppend) and \
                            (len(entriesToSend[sth]) > 0) and (len(entriesToAppend[sth]) > 0):
                        logging.info(
                            "NOW, SAVING/APPENDING {} PREPROCESSED {}".format(len(entriesToAppend[sth]), sth.upper()))
                        toAppend, self.preProcessedEntries = entriesToAppend[sth].fillna("None"), self.preProcessedEntries.fillna("None")
                        # logging.info(toAppend)
                        self.preProcessedEntries = pd.concat([self.preProcessedEntries, toAppend],
                                                             ignore_index=True)
                        self.preProcessedEntries.reset_index(inplace=True, drop=True)
                        # logging.info("NOW, LATEST PREPROCESSED ENTRIES ...")
                        # logging.info(self.preProcessedEntries)
                        self.saveProcessedEntries()
            logging.info("")
            # logging.info("AFTER PREPROCESSING ...")
            # logging.info(self.preProcessedEntries)
            logging.info("DONE PREPROCESSING AND SENDING ALL {} ENTRIES".format(len(self.preProcessedEntries)))
            return True
        else:
            logging.info("SORRY, ENTRIES ARE INVALID")
        return None

    def processEntries(self, entries):
        logging.info("AUTO-PARSER PROCESSING ENTRY -> " + self.toString())
        logging.info("ENTRY -> {}".format(str(entries)))
        return self.preProcessEntries(self.getDataFrame(dataset=entries))

    def processFile(self, path):  # READ THIS FILE BASED ON self.pathFormat["format"]
        logging.info("AUTO-PARSER PROCESSING FILE -> " + self.toString())
        logging.info("FILE PATH -> " + path)
        if self.pathFormat["path"] in path:  # CANNOT USE self.pathFormat["path"] is path COZ path ISN'T A STRING VALUE
            logging.info("PATH IS VALID WITH THIS AUTO-PARSER OBJECT, THEREFORE NOW PARSING ...")
            return self.preProcessEntries(self.getDataFrame(path=path))
        else:
            logging.info("PATH IS NOT VALID WITH THIS AUTO-PARSER OBJECT")
        return None

    def getDataFrame(self, dataset=None, path=None):
        try:
            df = None
            if (path is not None) and (len(path) > 0) and (os.path.isfile(path)):
                logging.info(
                    "GETTING DATA FRAME FROM FILE IN \"{}\" FORMAT; PATH -> {}".format(self.pathFormat["format"], path))
                if self.pathFormat["format"] is "tsv":
                    df = pd.read_csv(path, sep='\t', lineterminator='\r', header=None)
                elif self.pathFormat["format"] is "csv":
                    if self.source == "Nikto":
                        logging.info("READING NIKTO CSV FILE ...")
                        df = pd.read_csv(path, sep=',', skiprows=[0], header=None)
                    else:
                        df = pd.read_csv(path, sep=',', header=None)
                elif self.pathFormat["format"] is "line":
                    df = pd.read_csv(path, sep=',', header=None)
                elif self.pathFormat["format"] is "xls":
                    df = pd.read_excel(...)
                elif self.pathFormat["format"] is "json":
                    df = pd.read_json(...)
                elif self.pathFormat["format"] is "html":
                    df = pd.read_html(...)
                elif self.pathFormat["format"] is "xml":
                    return None
                else:
                    return None
            elif (dataset is not None) and (len(dataset) > 0):
                logging.info("GETTING DATA FRAME FROM DATA-SET (ARRAY)")
                pass  # PUT MORE FUNCTIONALITY OVER HERE, WHENEVER IT'S REQUIRED ..
            else:
                logging.info("INCORRECT PARAMS, CANNOT RETRIEVE DATA-FRAME")
            if df is not None:
                return self.refineDataFrame(df)
        except Exception as e:
            logging.info("CANNOT GET DATA FRAME FROM FILE/DATASET")
            logging.info(e)
            if "PROCESSED" not in path:
                logging.info("RESETTING PROCESSED ENTRIES DATA")
                self.resetProcessedEntries()
            raise e
        return None

    def refineDataFrame(self, df):  # MAKE SURE THAT df INCLUDES ALL HEADERS (COLUMNS) BASED ON SOURCE, FILE, ETC
        logging.info("REFINING DATA FRAME TO BE RETURNED")
        """
        logging.info("")
        logging.info("COLUMNS!!")
        logging.info("OLD -> {}".format(df.columns.values))
        logging.info("NEW -> {}".format(columns))
        logging.info("")
        logging.info("DATA BEFORE FILLING, SLICING & RENAMING")
        logging.info("")
        logging.info(df)
        """
        df.fillna("-")  # MAYBE IT SHOULD BE df = df.fillna("-") DOE
        if len(self.renameColumns) < len(df.columns.values):
            logging.info("TOO MANY UNWANTED COLUMNS, SLICING ...")
            df = df.iloc[0:len(df), 0:len(self.renameColumns)]
        df.rename(columns=self.renameColumns,
                  inplace=True)  # MAYBE IT SHOULD BE df = df.rename(columns=self.renameColumns, inplace=True) DOE
        """
        logging.info("")
        logging.info("DATA AFTER FILLING, SLICING & RENAMING")
        logging.info("")
        logging.info(df)
        """
        return df
