import json;
from datetime import datetime

def GetJsonFile(filename):
    with open(filename) as file:
        return json.load(file)

def OverWriteJsonFile(JsonData, filename):
    with open(filename, 'w') as file:
        json.dump(JsonData, file)

def GetDate():
    CurrentDateTime = datetime.now()
    return CurrentDateTime.date()

def FormatDailyInstance(MemberList):
    ReturnDict = {}
    for MemberDict in MemberList:
        ReturnDict[MemberDict["tag"]] = MemberDict["trophies"]
    return ReturnDict

def AddDailyInstance(JsonDict, MemberDict):
    date = f"{GetDate()}"
    for key, trophy in MemberDict.items():
        JsonDict[key] = {date: trophy}

def main():
    ClubData = GetJsonFile("data/club.json") # 2024-03-24
    DailyData = GetJsonFile("data/dailydata.json")
    Members = ClubData["members"] # List of member dictionary in trophy order
    MemberTrophyDict = FormatDailyInstance(Members)
    
    AddDailyInstance(DailyData, MemberTrophyDict)
    OverWriteJsonFile(DailyData, "data/dailydata.json")

if __name__ == "__main__":
    main()