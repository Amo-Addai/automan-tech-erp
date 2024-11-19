import pandas as pd
import numpy as np
import re, os, time, json


def refineDataFrame(df):
    try: 
        df = df.fillna("-")  # MAYBE IT SHOULD BE df = df.fillna("-") DOE
        df[ ["mobile", "extra mobile"] ] = df[ ["mobile", "extra mobile"] ].astype(str)
        # 
        obj, eits = {}, []
        print("REFINING DATAFRAME -> {}".format(df))
        for i, row in df.iterrows():
            for x in ["mobile", "extra mobile"]:
                if row[x].endswith(".0"):
                    row[x] = row[x].replace(".0", "")
            # 
            print("ROW {} -> {}".format(i, row))
            obj = {
                "type": "Prospect",
                "username": row["username"],
                "first_name": row["first name"],
                "last_name": row["last name"],
                "other_names": "",
                "full_name": "",
                "gender": row["gender"],
                "age": 25,
                "email": row["email address"],
                "phone": row["mobile"],
                "home_address": row["Physical Address"],
                "postal_address": row["Postal Address"],
                "contact_method": "Email",
                "social_media": {
                    "website": { "link": row["website"] },
                    "twitter": { "link": row["twitter"] },
                    "skype": { "link": row["Skype"] },
                    "linkedin": { "link": row["LinkedIn"] },
                },
                "segmentation": {
                    "geographics": {
                        "nationality": row["nationality"],
                    }
                },
                "preferences": {
                    "contact_methods": ["Email", "SMS", "USSD"],
                    "extra_contacts": {
                        "email": [ row["extra email address"] ],
                        "phone": [ row["extra mobile"] ],
                    }
                }
            }
            print("")
            print("OBJ -> {}".format(obj))
            eits.append(obj)
            print("")
        # NOW, WRITE THE JSON DATA INTO A .json FILE
        print("JSON -> {}".format(eits))
        print("")
        writePath = 'eits.json' # DON'T USE THIS -> df.to_json(path="./eits.json")
        with open(writePath, 'w') as outfile:
            print("")
            print("NOW WRITING TO FILE -> {}".format(writePath))
            json.dump(eits, outfile)
    except Exception as e:
        print("CANNOT GET DATA FRAME FROM FILE/DATASET")
        print(e)
        raise e
    return None


def getDataFrame(dataset=None, path=None):
    try: 
        print("PATH -> {}".format(path))
        print("")
        df = None
        if (path is not None) and (len(path) > 0) and (os.path.isfile(path)):
            print("GETTING DATA FRAME FROM EITs FILE IN WITH PATH -> {}".format(path))
            df = pd.read_csv(path, sep=',', header=0)
        elif (dataset is not None) and (len(dataset) > 0):
            print("GETTING DATA FRAME FROM DATA-SET (ARRAY)")
            pass  # PUT MORE FUNCTIONALITY OVER HERE, WHENEVER IT'S REQUIRED ..
        else:
            print("INCORRECT PARAMS, CANNOT RETRIEVE DATA-FRAME")
        if df is not None:
            return refineDataFrame(df)
    except Exception as e:
        print("CANNOT GET DATA FRAME FROM FILE/DATASET")
        print(e)
        raise e
    return None


cwd = os.getcwd() + "/"
print("CURRENT WORKING DIRECTORY -> {}".format(cwd))
getDataFrame(path="{}".format(cwd) + "MEST-Business-Cards-EITS-Class-2019.csv")
