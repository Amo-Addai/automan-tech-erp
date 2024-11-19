import json

'''
THIS CLASS IS MAINLY USED TO ISSUE COMMANDS TO AUTO-AUDIT SOURCES/TOOLS TO BEGIN OPERATIONS,
AND ALSO TO MONITOR THE CORRESPONDING FILE LOGS OF THESE SOURCES/TOOLS
'''


class CLI:

    def __init__(self):
        pass

    def parseOptions(self, params):
        filepath = params[0]
        params = params[1:len(params)]
        print("NOW, PARSING OPTIONS -> " + str(params))
        if len(params) is 2:  # PARSE JSON (--json) OPTION HERE
            if (params[0] == "--json") or (params[0] == "-j"):
                return json.loads(params[1])
            elif (params[0] == "--jsonbad") or (params[0] == "-jb"):
                print("BAD JSON!!! CONVERTING BACK TO PREFERRED FORMAT ...")
                badJson = params[1]
                print(badJson)
                goodJson = badJson.replace('%%%QUOTATION&&&', '"')
                print(goodJson)
                return json.loads(goodJson)

        else:  # PARSE OTHER TYPES OF OPTIONS HERE ...
            pass
        # PERFORM ALL PARSING OPERATIONS TO GET params INTO EXPECTED FORMAT
        # params = {"access_token": "token", "settings": {"autoaudit": "Some AutoAudit", "sources": {}}}
        return params

    def showOutput(self, msg):
        print(msg)
