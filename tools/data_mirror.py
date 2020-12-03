import requests
import json
from pprint import pprint

GROUPS_FILE = "./src/meetups.json"
DATA_FILE = "./src/calendarEntries.json"

newEntries = {}
with open(GROUPS_FILE, "r") as f:
    meetupGroups = json.load(f)
    if meetupGroups:
        for group in meetupGroups:
            meetupId = group.get('meetupId')
            url = f'https://www.meetup.com/{meetupId}/events/json/'
            try:
                r = requests.get(url)
                assert r.status_code == 200, "Invalid request"
                events = r.json()
                for event in events:
                    event_id = event.get('event_id')
                    event['meetupId'] = meetupId
                    newEntries[event_id] = event
            except Exception as e:
                print(f"Error processing {group.get('name')}", e)


with open(DATA_FILE, "w+") as f:
    try:
        entriesData = json.load(f)
    except Exception as e:
        entriesData = {}
    
    entriesData = {
        **entriesData,
        **newEntries,
    }
    json.dump(list(entriesData.values()), f)

pprint(entriesData)
