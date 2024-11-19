import json, asyncio, time, sys

from CONTROLLER.SettingsHandler import SettingsHandler
from CONTROLLER.AccessFileSystem import AccessFileSystem
from CONTROLLER.AutoParser import AutoParser
from CONTROLLER.AccessAutomanAPI import AccessAutomanAPI
#
from MODEL.ENUMERATIONS.AutomanEnumerations import AutoAuditingSleeperEnumerations as enum
#
from VIEW.CLI import CLI

URL = ""


class AutoAuditingSleeperApp:

    def __init__(self):
        self._loop = None
        #
        self._isActive = False
        self._api_url = ""
        self._access_token = ""
        self._data = {}
        #
        self._settingsHandler = None
        self._fileSystem = None
        self._autoParser = None
        self._server = None
        #
        self._cli = None

    @property
    def loop(self):
        return self._loop

    @loop.setter
    def loop(self, x):
        self._loop = x

    @property
    def api_url(self):
        return self._api_url

    @api_url.setter
    def api_url(self, x):
        self._api_url = x

    @property
    def access_token(self):
        return self._access_token

    @access_token.setter
    def access_token(self, x):
        self._access_token = x

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, x):
        self._data = x

    @property
    def cli(self):
        return self._cli

    @cli.setter
    def cli(self, x):
        self._cli = x

    @property
    def settingsHandler(self):
        return self._settingsHandler

    @settingsHandler.setter
    def settingsHandler(self, x):
        self._settingsHandler = x

    @property
    def fileSystem(self):
        return self._fileSystem

    @fileSystem.setter
    def fileSystem(self, x):
        self._fileSystem = x

    @property
    def autoParser(self):
        return self._autoParser

    @autoParser.setter
    def autoParser(self, x):
        self._autoParser = x

    @property
    def server(self):
        return self._server

    @server.setter
    def server(self, x):
        self._server = x

    @property
    def isActive(self):
        return self._isActive

    @isActive.setter
    def isActive(self, x):
        self._isActive = x

    def validateParameters(self, params):  # PERFORM SOME VALIDATIONS ON params
        print("FINALLY -> " + json.dumps(params))
        if "access_token" in params and "settings" in params:
            x = params["settings"]
            if ("autoaudit" in x or "action" in x) and ("sources" in x):
                return True
        return False

    def setup(self, params):
        try:
            self.cli = CLI()
            params = self.cli.parseOptions(params)
            if self.validateParameters(params):
                if sys.platform == 'win32':
                    print("WINDOWS (Win32) SYSTEM")
                    self.loop = asyncio.ProactorEventLoop()
                    asyncio.set_event_loop(self.loop)
                else:
                    self.loop = asyncio.get_event_loop()
                print("PARAMS VALIDATED, NOW SETTING UP")
                self.api_url = params["url"]
                self.access_token = params["access_token"]
                self.settingsHandler = SettingsHandler(params["settings"])
                self.fileSystem = AccessFileSystem(params)
                # self.autoParser = AutoParser()
                # self.server = AccessAutomanAPI(self.api_url, self.access_token)
                #
                self.isActive = True
                return self
        except Exception as e:
            print("ERROR OCCURRED DURING SETUP -> " + e.message)
            print(e)
        self.isActive = False
        return None

    def start(self):
        if self.isActive:
            self.cli.showOutput("AUTO-AUDITING SLEEPER HAS OFFICIALLY STARTED!!!")
            settings, autoauditOrActionType, autoauditOrAction = self.settingsHandler.settings, "", ""
            if "autoaudit" in settings:
                autoauditOrActionType = "autoaudit"
                autoauditOrAction = settings[autoauditOrActionType]
            elif "action" in settings:
                autoauditOrActionType = "action"
                autoauditOrAction = settings[autoauditOrActionType]
            sources = settings["sources"]
            #   NOW, CONTACT AccessFileSystem.py TO PERFORM AUTOAUDIT/ACTION
            self.cli.showOutput(
                "Performing " + autoauditOrActionType + " '" + autoauditOrAction + "' with sources " + str(
                    sources.keys()))
            success = self.loop.run_until_complete (
              self.fileSystem.performAutoAuditOrAction(autoauditOrActionType, autoauditOrAction, sources)
            )
            # success = self.fileSystem.performAutoAuditOrAction(autoauditOrActionType, autoauditOrAction, sources)
            self.cli.showOutput("")
            if success:
                self.cli.showOutput(
                    autoauditOrActionType + " '" + autoauditOrAction + "' has been performed successfully by all sources ...")
            else:
                self.cli.showOutput("Sorry, " + autoauditOrActionType + " '" + autoauditOrAction + "' could not be performed successfully")
            self.cli.showOutput("")
        else:
            self.cli.showOutput("AUTO-AUDITING SLEEPER CANNOT START BECAUSE IT IS NOT ACIVE")

    def stop(self):
        if self.isActive:  # PERFORM FUNCTIONS TO END THE EXECUTION OF THIS APP
            self.isActive = False
            print("ABOUT TO END SLEEPER, HALTING FILE MONITORING ...")
            self.fileSystem.stopFileMonitoring()
        else:
            pass

    def getSettingsValue(self, key):
        obj = self.settingsHandler.getDashboardValue(key)
        return obj if obj is not None else self.settingsHandler.getDashboardDefaultValue(key)


#   THIS TRICK HELPS MAKE THIS CLASS A SINGLETON
appInstance = AutoAuditingSleeperApp()


def getApp():
    return appInstance
