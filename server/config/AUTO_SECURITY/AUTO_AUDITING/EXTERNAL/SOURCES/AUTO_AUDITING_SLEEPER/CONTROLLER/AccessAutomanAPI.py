import json, requests, socket, logging

'''
THIS CLASS IS MAINLY USED TO SEND AUTOAUDITS (AUTOLOGS/AUTOEVENTS) TO Auto-API AFTER DATA IN STANDARD FORMAT (JSON)
HAS BEEN RETRIEVED BY AutoAuditingSleeperApp.py FROM THE AUTOAUDITING SOURCES/TOOLS
'''


class AccessAutomanAPI:
    def __init__(self, url, access_token):
        self.url = url
        self.access_token = access_token
        self.result = {}
        self.data = []

    def makeRequest(self, url, meth, query):
        try:
            u = self.url + ("" if (self.url.endswith("/")) else "/") + url + "?access_token=" + self.access_token
            data = json.dumps(query)
            logging.info("MAKING {} REQUEST TO URL -> {}".format(meth, u))
            logging.info("QUERY -> {}".format(json.dumps(query)))
            headers = {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + self.access_token
            }
            r = None
            if meth is 'GET':
                r = requests.get(u, data=data, headers=headers)
            elif meth is 'POST':
                r = requests.post(u, data=data, headers=headers)
            if meth is 'PUT':
                r = requests.put(u, data=data, headers=headers)
            elif meth is 'PATCH':
                r = requests.patch(u, data=data, headers=headers)
            if meth is 'DELETE':
                r = requests.delete(u, data=data, headers=headers)

            if r.status_code == requests.codes.ok:
                sth = r.json()
                logging.info("RESULT IN JSON ({}) -> {}".format(type(sth), sth))
                if ("success" in sth) and (sth["success"] is False):
                    if ("message" in sth) and (len(sth["message"]) > 0):
                        logging.info("ERROR MESSAGE -> {}".format(sth["message"]))
                else:  # ELSE sth IS JUST THE DATA REQUIRED FROM THE SERVER
                    result = sth  # json.loads(r)
                    logging.info("FINAL RESULT TO RETURN -> {}".format(result))
                    return sth
            else:  # CHECK IF ACCESS TOKEN HAS EXPIRED, THEN END THIS PROGRAM ABRUPTLY IF SO
                logging.info("RESULT OBJECT -> {}".format(r.raw))
                pass
        except Exception as e:
            logging.info("ERROR DURING REQUEST -> {}".format(e))
        return None

    def getAutoAPIAutoAuditingRoutesAndData(self, sth, source, autoaudit, data):
        try:
            body, url = None, "api/autosecurity/autoauditing/autoaudits/{}/External/{}".format(sth, source)
            if len(data) > 1:  # ALL OBJECTS IN data MUST HAVE "params" & "data" PROPERTIES
                logging.info("BULK DATA ({}) - {} !!!".format(sth, len(data)))
                params = {
                    "source": source,
                    "autoaudit": autoaudit
                }
                dataToSend = []
                for body in data:
                    if sth == "autoevents":  # AUTO-PARSER WOULD'VE PUT THE EXTRA OPTIONS WITHIN body (data[0])
                        logging.info(
                            "SENDING THIS AUTOEVENT STRAIGHT AWAY, THEREFORE, body MUST HAVE 'extra' & 'body' ITSELF ..")
                        extra, body = body["extra"], body["body"]
                        params["autoevent"], params["emergency_level"] = extra["autoevent"], extra["emergency_level"]
                    dataToSend.append({"params": params, "data": body})
                body = dataToSend  # FINALLY, ASSIGN dataToSend TO body
                logging.info("URL -> {}".format(url))
                logging.info("BODY -> {}".format(json.dumps(body)))
                return url, body
            elif len(data) == 1:
                logging.info("JUST 1 OBJECT ({}) !!!".format(sth))
                url += ("/{}".format(autoaudit))
                body = data[0]
                if sth == "autoevents":  # AUTO-PARSER WOULD'VE PUT THE EXTRA OPTIONS WITHIN body (data[0])
                    logging.info(
                        "SENDING THIS AUTOEVENT STRAIGHT AWAY, THEREFORE, body MUST HAVE 'extra' & 'body' ITSELF ..")
                    extra, body = body["extra"], body["body"]
                    url += ("/{}/{}".format(extra["autoevent"], extra["emergency_level"]))
                logging.info("URL -> {}".format(url))
                logging.info("BODY -> {}".format(json.dumps(body)))
                return url, body
        except Exception as e:
            logging.info(e)
        return None, None

    def sendAutoLogs(self, source, autoaudit, autologs):
        url, data = self.getAutoAPIAutoAuditingRoutesAndData("autologs", source, autoaudit, autologs)
        if (url is not None) and (data is not None):
            # SEND data IN BITS IF IT'S AN ARRAY AND IT CONTAINS MORE THAN 60 OBJECTS
            self.result = self.makeRequest(url, "POST", data)
            logging.info("RESULT RETURNED ({}) -> {}".format(type(self.result), self.result))
            if (self.result is not None) and ("success" in self.result) and (self.result["success"] is True):
                logging.info("AUTO-LOG(S) SENT TO AUTO-API")
                return True
        return False

    def sendAutoEvents(self, source, autoaudit, autoevents):
        url, data = self.getAutoAPIAutoAuditingRoutesAndData("autoevents", source, autoaudit, autoevents)
        if (url is not None) and (data is not None):
            # SEND data IN BITS IF IT'S AN ARRAY AND IT CONTAINS MORE THAN 60 OBJECTS
            self.result = self.makeRequest(url, "POST", data)
            logging.info("RESULT RETURNED ({}) -> {}".format(type(self.result), self.result))
            if (self.result is not None) and ("success" in self.result) and (self.result["success"] is True):
                logging.info("AUTO-EVENT(S) SENT TO AUTO-API")
                return True
        return False

    def getAutoAPIRoutes(self, sth):
        return ""

    def get(self, sth, condition):
        try:
            self.result = self.makeRequest(self.getAutoAPIRoutes(sth), "GET",
                                           "condition=" + condition if condition is not None else None)
        except:
            print("error occurred: ")
        else:
            if (self.result is not None) and (len(self.result) > 0):
                self.data[sth] = self.result.json()

    def add(self, sth, data):
        self.result = self.makeRequest(self.getAutoAPIRoutes(sth), "POST", data if data is not None else None)
        if (self.result is not None) and ("_id" in self.result):
            self.renewData(sth, self.result["id"], "add")
            return True
        return False

    def edit(self, sth, id, data):
        self.result = self.makeRequest(self.getAutoAPIRoutes(sth) + id, "PUT", data if data is not None else None)
        if (self.result is not None) and ("_id" in self.result):
            self.renewData(sth, self.result["id"], "edit")
            return True
        return False

    def delete(self, sth, id):
        self.result = self.makeRequest(self.getAutoAPIRoutes(sth) + id, "DELETE", None)
        if (self.result is not None) and ("_id" in self.result):
            self.renewData(sth, self.result["id"], "delete")
            return True
        return False

    ###################################
    #          SERVER FUNCTIONS

    def renewData(self, sth, id, option):
        if option not in ["add", "edit", "delete"]:
            return
        if option is "add":
            self.data[sth.name].append(self.result)
        else:
            for item in self.data[sth.name]:
                if item.id() is id:
                    self.data[sth.name].remove(item)
                    if option is "edit":
                        self.data[sth.name].append(self.result)

    ###############################
    # SOCKET PROGRAMMING FUNCTIONS
    class AccessAutomanSocketAPI:
        sock, host, post, MSGLEN = None, "", 80, 4096

        def __init__(self, host, port, sock=None):
            try:
                if sock is None:
                    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                else:
                    self.sock = sock
            except socket.error as msg:
                print('Failed to create socket. Error code: ' + str(msg[0]) + ' , Error message : ' + msg[1])
            else:
                print('Socket Created')
                self.host = host
                self.port = port

        def connect(self):
            self.sock.connect((self.host, self.port))

        def close(self):
            self.sock.close()

        def send(self, msg):
            try:
                self.sock.sendall(msg)
                # OR USE THIS
                # totalsent = 0
                # while totalsent < self.MSGLEN:
                #     sent = self.sock.send(msg[totalsent:])
                #     if sent == 0:
                #         raise RuntimeError("socket connection broken")
                #     totalsent = totalsent + sent
            except socket.error:
                print('Send failed')
                return False
            else:
                print('Message sent successfully')
                return True

        def receive(self):
            try:
                chunks = []
                bytes = 0
                while bytes < self.MSGLEN:
                    chunk = self.sock.recv(min(self.MSGLEN - bytes, 2048))
                    if chunk == '':
                        raise RuntimeError("socket connection broken")
                    chunks.append(chunk)
                    bytes += len(chunk)
            except socket.error:
                print('Send failed')
                return None
            else:
                return ''.join(chunks)
