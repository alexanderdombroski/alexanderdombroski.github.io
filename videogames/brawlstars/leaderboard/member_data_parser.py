import json;
from datetime import datetime, timedelta

# Modify Json Files

def GetJsonFile(filename):
    with open(filename) as file:
        return json.load(file)

def OverWriteJsonFile(JsonData, filename):
    with open(filename, 'w') as file:
        json.dump(JsonData, file)

# Format dictionaryies

def FormatDailyInstance(MemberList):
    ReturnDict = {}
    for MemberDict in MemberList:
        ReturnDict[MemberDict["tag"]] = MemberDict["trophies"]
    return ReturnDict

def AddDailyInstance(JsonDict, MemberDayDict):
    date = f"{GetDate()}"
    # date = "2024-03-23"
    for key, trophy in MemberDayDict.items():
        if key not in JsonDict:
            JsonDict[key] = {}
        JsonDict[key][date] = trophy
        if len(JsonDict[key]) > 30:
            JsonDict[key].popitem(0)

def UpdateMembers(MemberNamesDict, MemberData):
    for MemberDataDict in MemberData:
        MemberNamesDict[MemberDataDict["tag"]] = MemberDataDict["name"]

# Leaderboard

def GetDate():
    CurrentDateTime = datetime.now()
    return CurrentDateTime.date()

def GetPreviousDate(days):
    return GetDate() - timedelta(days=days)

def MakeLeaderBoard(DailyData, DayDiff=1):
    # Format Dates
    today = GetDate()
    previousDay = f"{GetPreviousDate(DayDiff)}"
    today = f"{today}"
    # Format Leaderboard
    leaderboard = {}
    for key, instanceDict in DailyData.items():
        leaderboard[key] = instanceDict[today] - instanceDict[previousDay]
    # Sort the leaderboard
    leaderboard = SortLeaderBoard(leaderboard)
    return leaderboard

def SortLeaderBoard(leaderboard):
    return dict(sorted(leaderboard.items(), key=lambda item: item[1], reverse=True))

def DisplayLeaderBoard(leaderboard, playernames):
    position = 0
    upper_position = -1
    for key, trophy in leaderboard.items():
        if upper_position != trophy:
            position +=1
        print(f"{position}. {playernames[key]}: {trophy}")
        upper_position = trophy

def main():
    # Update Daily Trophy Counts
    ClubData = GetJsonFile("data/day2.json")
    DailyData = GetJsonFile("data/dailydata.json")
    MemberDataDict = ClubData["members"] # List of member dictionary in trophy order
    MemberTrophyDict = FormatDailyInstance(MemberDataDict)

    AddDailyInstance(DailyData, MemberTrophyDict)
    # OverWriteJsonFile(DailyData, "data/dailydata.json")

    # Update Member/Key File
    playernames = GetJsonFile("data/members.json")
    UpdateMembers(playernames, MemberDataDict)
    OverWriteJsonFile(playernames, "data/members.json")

    # LeaderBoards
    DailyLeaderBoard = MakeLeaderBoard(DailyData)
    DisplayLeaderBoard(DailyLeaderBoard, playernames)

if __name__ == "__main__":
    main()