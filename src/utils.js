import moment from 'moment';

/*
 * Use CORS anywhere to download passed JSON URL
 * TODO: @XaviTorello: fix Meetup.com CORS issues avoiding "CORS Anywhere middleware"
 */
export async function fetchJsonCalendar({ url, options = {} }) {
  const { direct = false } = options;
  const urlParsed = direct ? url : `https://cors-anywhere.herokuapp.com/${url}`;
  return (await fetch(urlParsed, { ...options })).json();
}

/*
 * Defines how the Calendar will render the Event time template
 */
export function getTimeTemplate(schedule, isAllDay) {
  const html = [];
  const start = moment(schedule.start.toUTCString());
  if (!isAllDay) {
    html.push('<strong>' + start.format('HH:mm') + '</strong> ');
  }
  if (schedule.isPrivate) {
    html.push('<span class="calendar-font-icon ic-lock-b"></span>');
    html.push(' Private');
  } else {
    if (schedule.isReadOnly) {
      html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
    } else if (schedule.recurrenceRule) {
      html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
    } else if (schedule.attendees.length) {
      html.push('<span class="calendar-font-icon ic-user-b"></span>');
    } else if (schedule.location) {
      html.push('<span class="calendar-font-icon ic-location-b"></span>');
    }
    html.push(' ' + schedule.title);
  }
  return html.join('');
}
