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

import { fetchJsonCalendar, getTimeTemplate, setEventListener } from './utils';

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
  meetupGroups.forEach((calendar) => {
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

/*
 * Try to get all events for all activated meetup groups
 */
async function prepareEvents() {
  const scheduleList = [];
  for (const group of meetupGroups) {
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
          newSchedule.calendarId = calendar.id;

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
  }
  return scheduleList;
}

// Initialize Calendar
(async () => {
  const calendar = new Calendar('#calendar', {
    defaultView: 'week',
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

  // // event handlers
  // calendar.on({
  //   clickMore: function (e) {
  //     console.log('clickMore', e);
  //   },
  //   clickSchedule: function (e) {
  //     console.log('clickSchedule', e);
  //   },
  //   clickDayname: function (date) {
  //     console.log('clickDayname', date);
  //   },
  //   beforeCreateSchedule: function (e) {
  //     console.log('beforeCreateSchedule', e);
  //     saveNewSchedule(e);
  //   },
  //   beforeUpdateSchedule: function (e) {
  //     var schedule = e.schedule;
  //     var changes = e.changes;

  //     console.log('beforeUpdateSchedule', e);

  //     if (changes && !changes.isAllDay && schedule.category === 'allday') {
  //       changes.category = 'time';
  //     }

  //     calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
  //     refreshScheduleVisibility();
  //   },
  //   beforeDeleteSchedule: function (e) {
  //     console.log('beforeDeleteSchedule', e);
  //     calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
  //   },
  //   afterRenderSchedule: function (e) {
  //     var schedule = e.schedule;
  //     // var element = calendar.getElement(schedule.id, schedule.calendarId);
  //     // console.log('afterRenderSchedule', element);
  //   },
  //   clickTimezonesCollapseBtn: function (timezonesCollapsed) {
  //     console.log('timezonesCollapsed', timezonesCollapsed);

  //     if (timezonesCollapsed) {
  //       calendar.setTheme({
  //         'week.daygridLeft.width': '77px',
  //         'week.timegridLeft.width': '77px',
  //       });
  //     } else {
  //       calendar.setTheme({
  //         'week.daygridLeft.width': '60px',
  //         'week.timegridLeft.width': '60px',
  //       });
  //     }

  //     return true;
  //   },
  // });

  const resizeThrottled = tui.util.throttle(() => {
    calendar.render();
  }, 50);

  setEventListener(resizeThrottled);

  // Prepare Calendars
  prepareCalendars();

  // Fetch and prepare events
  const scheduleList = await prepareEvents();
  console.debug('Fetched events', scheduleList);
  calendar.createSchedules(scheduleList);
})();
