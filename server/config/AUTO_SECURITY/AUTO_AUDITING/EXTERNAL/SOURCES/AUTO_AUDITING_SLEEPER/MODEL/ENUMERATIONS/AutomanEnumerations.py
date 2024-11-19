# from enum import Enum     # for enum34, or the stdlib version
# from aenum import Enum  # for the aenum version

# ONLY THE NEEDED ENUMERATIONS ARE SPECIFIED
AutoAuditingSleeperEnumerations = None


# AutoAuditingSleeperEnumerations = Enum('AutoAuditingSleeperEnumerations',
#                                        'autoaudits autologs autoevents Bro Ossec Kismet Lynis')
# SAMPLE USE - AutomanEnumerations.securitylogins OR AutomanEnumerations.Bro.name
# TO RETURN ACTUAL STRING (.value to return number)

# FIND A WAY TO ATTACH THESE FUNCTIONS TO THE AUTOMAN ENUMERATIONS


def toString(sth):
    # return sth.name  # YOU CAN ALSO JUST CALL THIS ONE TOO THOUGH
    if sth.name is "":
        return ""
    elif sth.name is "autoaudits":
        return "autoaudits"
    elif sth.name is "autologs":
        return "autologs"
    elif sth.name is "autoevents":
        return "autoevents"
    #
    elif sth.name is "Bro":
        return "Bro"
    elif sth.name is "Ossec":
        return "Ossec"
    elif sth.name is "Kismet":
        return "Kismet"
    elif sth.name is "Lynis":
        return "Lynis"
    else:
        return None


def toSingularLowerCase(sth):
    str = sth.name
    str = str.replace("ies", "y") if str.trim().endsWith("ies") else str
    return str.substring(0, str.lastIndexOf("s"))


def toSingularUpperCase(sth):
    return toSingularLowerCase(sth).toUpperCase()


def toPluralUpperCase(sth):
    return sth.name.toUpperCase()


def toSingularCamelCase(sth):
    if sth.name is "openvas":
        return "OpenVas"
    str = toSingularLowerCase(sth)
    return str.replace((str.charAt(0) + ""), (str.charAt(0) + "").toUpperCase())


def toPluralCamelCase(sth):
    str = sth.name
    return str.replace((str.charAt(0) + ""), (str.charAt(0) + "").toUpperCase())
