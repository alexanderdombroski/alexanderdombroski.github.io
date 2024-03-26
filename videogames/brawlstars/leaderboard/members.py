from member_data_parser import GetJsonFile

def main():
    members = GetJsonFile("data/members.json")
    for key, name in members.items():
        print(f"{key}: {name}")

if __name__ == "__main__":
    main()
