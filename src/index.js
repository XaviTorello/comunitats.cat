'use strict';

import Calendar from 'tui-calendar';
import 'tui-calendar/dist/tui-calendar.css';

import { addHours } from 'date-fns';

// import datePicker from 'tui-date-picker';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
// import 'tui-code-snippet/src/js/index';

// import { Schedule } from './models';
import Schedule from './models/schedule';

// Load meetup groups
import settings from './settings.json';
import meetupGroups from './meetups.json';
import calendarEntries from './calendarEntries.json';

import { getTimeTemplate, setEventListener } from './utils';

const defaults = {
  color: '#ffffff',
  bgColor: 'green',
};

/*
 * "Dirty" calendars lists initialization
 */
async function prepareCalendars() {
  var calendarList = document.getElementById('calendarList');
  var html = [];
  meetupGroups
    .sort((a, b) => {
      const nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
      return nameA < nameB ? -1 : 0;
    })
    .forEach((calendar) => {
      html.push(
        '<div class="lnb-calendars-item"><label>' +
          '<input type="checkbox" class="tui-full-calendar-checkbox-round" value="' +
          calendar.id +
          '" checked>' +
          '<span style="border-color: ' +
          calendar.borderColor +
          '; background-color: ' +
          calendar.bgColor +
          ';"></span>' +
          '<span>' +
          calendar.name +
          '</span>' +
          '</label></div>',
      );
    });
  calendarList.innerHTML = html.join('\n');
}

async function* prepareEvents() {
  /*
   * Prepare events from calendarEntries JSON
   *
   * Ready to be an async generator if more calendars should be fetched
   */
  const scheduleList = [];
  const groups = meetupGroups.reduce((result, item) => {
    const { meetupId } = item;
    result[meetupId] = item;
    return result;
  }, {});
  console.debug(`- Parsing calendar entries`);

  calendarEntries.forEach(
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
      meetupId,
      ...other
    }) => {
      console.debug(`  - Adding event "${title}"`);
      const {
        name: groupName,
        color,
        bgColor,
        dragBgColor,
        borderColor,
        ...group
      } = groups[meetupId] || {};
      const newSchedule = new Schedule();

      newSchedule.id = String(event_id);
      // newSchedule.calendarId = calendar.id;
      newSchedule.calendarId = groupName;

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

      scheduleList.push(newSchedule);
    },
  );

  yield scheduleList;
  // return scheduleList;
}

// Initialize Calendar
(async () => {
  const calendar = new Calendar('#calendar', {
    defaultView: 'month',
    taskView: true,
    scheduleView: true,
    usageStatistics: false,
    template: {
      monthDayname: function (dayname) {
        return (
          '<span class="calendar-week-dayname-name">' +
          dayname.label +
          '</span>'
        );
      },
      time: function (schedule) {
        return getTimeTemplate(schedule, false);
      },
    },
    month: {
      daynames: settings.daynames[settings.lang],
      startDayOfWeek: 1,
      narrowWeekend: true,
    },
    week: {
      daynames: settings.daynames[settings.lang],
      startDayOfWeek: 1,
      narrowWeekend: true,
    },
  });
  window.calendar = calendar;

  const resizeThrottled = tui.util.throttle(() => {
    calendar.render();
  }, 50);

  setEventListener(resizeThrottled);

  // Prepare Calendars
  prepareCalendars();

  // Fetch and prepare events
  let scheduleList = [];
  const eventsGenerator = prepareEvents();
  for await (const anScheduleList of eventsGenerator) {
    scheduleList = scheduleList.concat(anScheduleList);
    calendar.createSchedules(anScheduleList);
  }
  console.debug('Fetched events', scheduleList);
})();
