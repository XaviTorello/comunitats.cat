import requests
import json
from pprint import pprint

GROUPS_FILE = "./src/meetups.json"
DATA_FILE = "./src/calendarEntries.json"

try:
    with open(DATA_FILE, "r") as calendar_file:
        """
        Load current entries into a key based dict
        to simplify merge with new events
        """
        entries_list = json.load(calendar_file)
        entries = {}
        for event in entries_list:
            event_id = event.get("event_id")
            entries[event_id] = event
except FileNotFoundError as e:
    """
    Initialize entries if file does not exist
    """
    entries = {}

with open(GROUPS_FILE, "r") as groups_file:
    """
    Process all activated meetup groups fetching their upcoming 
    events in a `event_id` key dict
    """
    meetup_groups = json.load(groups_file)
    if meetup_groups:
        for group in meetup_groups:
            meetup_id = group.get("meetupId")
            url = f"https://www.meetup.com/{meetup_id}/events/json/"
            try:
                r = requests.get(url)
                assert r.status_code == 200, "Invalid request"
                events = r.json()
                for event in events:
                    event_id = event.get("event_id")
                    event["meetup_id"] = meetup_id
                    entries[event_id] = event
            except Exception as e:
                print(f"Error processing {group.get('name')}", e)

with open(DATA_FILE, "w") as calendar_file:
    """
    Merge dicts and save values (without keys) to data file
    """
    json.dump(list(entries.values()), calendar_file)

print(f"Saved {len(entries)} entries")
