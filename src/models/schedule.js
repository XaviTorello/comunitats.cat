'use strict';

export default class Schedule {
  constructor() {
    this.id = null;
    this.calendarId = null;

    this.title = null;
    this.body = null;
    this.isAllday = false;
    this.start = null;
    this.end = null;
    this.category = '';
    this.dueDateClass = '';

    this.color = null;
    this.bgColor = null;
    this.dragBgColor = null;
    this.borderColor = null;
    this.customStyle = '';

    this.isFocused = false;
    this.isPending = false;
    this.isVisible = true;
    this.isReadOnly = false;
    this.goingDuration = 0;
    this.comingDuration = 0;
    this.recurrenceRule = '';
    this.state = '';

    this.raw = {
      memo: '',
      hasToOrCc: false,
      hasRecurrenceRule: false,
      location: null,
      class: 'public', // or 'private'
      creator: {
        name: '',
        avatar: '',
        company: '',
        email: '',
        phone: '',
      },
    };
  }
}

/*
 * Try to get all events for all activated meetup groups
 */
async function* prepareEventsFromMeetup() {
  // const scheduleList = [];
  for (const group of meetupGroups) {
    const scheduleList = [];
    try {
      const {
        name,
        meetupId,
        color = defaults.color,
        bgColor = defaults.bgColor,
        dragBgColor,
        borderColor,
        timezone = settings.timezone,
        active = true,
      } = group;

      if (!active) continue;

      const meetupUrl = `https://www.meetup.com/${meetupId}/events/json/`;
      const result = await fetchJsonCalendar({ url: meetupUrl });
      console.debug(`- Getting events for "${name}"`, result);
      result.forEach(
        ({
          event_id,
          title,
          descr,
          event_url,
          type,
          local_time,
          chapter_url,
          venue_name,
          venue_lat,
          venue_lon,
          venue_address1,
          ...other
        }) => {
          console.debug(`  - Adding event "${title}"`);
          const newSchedule = new Schedule();

          newSchedule.id = String(event_id);
          // newSchedule.calendarId = calendar.id;
          newSchedule.calendarId = group.name;

          newSchedule.title = title;

          // Meetup API returns local dates with incorrect fixed EST timezone
          // TODO Deal with TZ!
          const parsedDate = local_time.split(' ').slice(0, 2).join('T');
          const time = new Date(parsedDate);
          newSchedule.start = time;
          newSchedule.end = addHours(time, 2);

          newSchedule.title = title;
          newSchedule.body = descr;
          newSchedule.isReadOnly = true;

          newSchedule.isPrivate = false;
          newSchedule.location = venue_name;
          newSchedule.attendees = 0;
          newSchedule.recurrenceRule = '';
          // newSchedule.state = chance.bool({ likelihood: 20 }) ? 'Free' : 'Busy';
          newSchedule.color = color;
          newSchedule.bgColor = bgColor;
          newSchedule.dragBgColor = dragBgColor || bgColor;
          newSchedule.borderColor = borderColor || bgColor;
          newSchedule.category = 'time';

          // newSchedule.raw.memo = chance.sentence();
          // newSchedule.raw.creator.name = chance.name();
          // newSchedule.raw.creator.avatar = chance.avatar();
          // newSchedule.raw.creator.company = chance.company();
          // newSchedule.raw.creator.email = chance.email();
          // newSchedule.raw.creator.phone = chance.phone();

          // if (chance.bool({ likelihood: 20 })) {
          //   var travelTime = chance.minute();
          //   newSchedule.goingDuration = travelTime;
          //   newSchedule.comingDuration = travelTime;
          // }
          scheduleList.push(newSchedule);
        },
      );
    } catch (error) {
      console.error(error);
    }
    yield scheduleList;
  }
  // return scheduleList;
}
