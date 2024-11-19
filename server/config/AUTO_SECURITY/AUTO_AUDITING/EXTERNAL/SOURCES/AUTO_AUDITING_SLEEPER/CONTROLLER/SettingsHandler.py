import json


class SettingsHandler:

    def __init__(self, settings):
        self._settings = {}
        self._defaultSettings = {
            "Some Prop": "Some Value"
        }
        self.setUpDashboardSettings(settings)

    @property
    def settings(self):
        return self._settings

    @settings.setter
    def settings(self, x):
        self._settings = x

    @property
    def defaultSettings(self):
        return self._defaultSettings

    @defaultSettings.setter
    def defaultSettings(self, x):
        self.defaultSettings = x

    #################################################################
    def setUpDashboardSettings(self, settings):
        # DO SOME VALIDATIONS ON settings FIRST THOUGH  if settings is not None else self.defaultSettings()
        self.settings = settings

    def resetSettings(self):
        self.settings = self.defaultSettings

    #################################################################
    #      FUNCTIONS TO ACCESS DASHBOARD SETTINGS

    def getDashboardDefaultValue(self, value):
        # YOU CAN DO SOME if else CHECKS ON value FIRST, BEFORE PROCEEDING ...
        return self.getDashboardValue(value + "Default")

    def getDashboardValue(self, key):
        return self.getValue(key, self.settings)

    #################################################################
    #      FUNCTIONS TO ACCESS SETTINGS

    def getValue(self, key, json=None):
        try:
            if json is None:
                json = self.settings
            if key in json:
                return json[key]
            for nextKey, nextJson in enumerate(json):
                try:
                    if key in nextJson:
                        return nextJson[key]
                    # IF NOT THE CALL self FUNCTION RECURSIVELY
                    value = self.getValue(key, nextJson)
                    if value is not None:
                        return value
                    # IF IT WAS NULL, THEN JUST MOVE ON TO THE NEXT OBJECT
                except:
                    print("error occurred")
                    continue  # IF THAT WASN'T A JSONOBJECT, LOOP JUST CONTINUES TO NEXT KEY

        except:
            print("error occurred")

        return None

    def setValue(self, key, value, json=None):
        try:
            if json is None:
                json = self.settings  # WE DON'T USE NO DEFAULT SETTINGS OVER HERE
            if key in json:
                json[key] = value
                return True
            for nextKey, nextJson in enumerate(json):
                try:
                    if key in nextJson:
                        nextJson[key] = value
                        return True

                    # IF NOT THE CALL self FUNCTION RECURSIVELY
                    if self.setValue(key, value, nextJson):
                        return True
                    # IF IT WAS FALSE, THEN JUST MOVE ON TO THE NEXT OBJECT
                except:
                    print("error occurred")
                    continue  # IF THAT WASN'T A JSONOBJECT, LOOP JUST CONTINUES TO NEXT KEY
        except:
            print("error occurred")
        return False
