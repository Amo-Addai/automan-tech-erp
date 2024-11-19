import pandas as pd
import numpy as np
import re, os, time, json


def refineDataFrame(df):
    try: 
        df = df.fillna("")  # MAYBE IT SHOULD BE df = df.fillna("-") DOE
        # 
        obj, subscribers = {}, []
        print("REFINING DATAFRAME -> {}".format(df))
        for i, row in df.iterrows():
            if len(row["email"]) > 0: # 
                print("ROW {} -> {}".format(i, row))
                obj = {
                    "type": "Individual",
                    "first_name": row["first_name"],
                    "last_name": row["last_name"],
                    "other_names": row["other_names"],
                    "full_name": "",
                    "gender": row["gender"],
                    "nationality": row["nationality"],
                    "age": row["age"],
                    "email": row["email"],
                    "phone": row["phone"],
                    "home_address": row["home_address"],
                    "postal_address": row["postal_address"],
                    "social_media": {
                        # "website": { "link": row["website"] },
                        # "twitter": { "link": row["twitter"] },
                        # "skype": { "link": row["Skype"] },
                        # "linkedin": { "link": row["LinkedIn"] },
                    },
                    "data": {
                        "interests": {
                            "properties": []
                        },
                        "subscribed": True
                    }
                }
                print("")
                print("OBJ -> {}".format(obj))
                subscribers.append(obj)
                print("")
        # NOW, WRITE THE JSON DATA INTO A .json FILE
        print("JSON -> {}".format(subscribers))
        print("")
        writePath = 'subscribers.json' # DON'T USE THIS -> df.to_json(path="./subscribers.json")
        with open(writePath, 'w') as outfile:
            print("")
            print("NOW WRITING TO FILE -> {}".format(writePath))
            json.dump(subscribers, outfile)
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
            print("GETTING DATA FRAME FROM FILE IN WITH PATH -> {}".format(path))
            df = pd.read_excel(path, sep=',', header=0)
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


cwd = os.getcwd() + "/prospects/"
print("CURRENT WORKING DIRECTORY -> {}".format(cwd))
getDataFrame(path="{}".format(cwd) + "subscribers.xlsx")
