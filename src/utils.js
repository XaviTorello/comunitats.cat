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
      // html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
    } else if (schedule.recurrenceRule) {
      html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
    } else if (schedule.attendees.length) {
      html.push('<span class="calendar-font-icon ic-user-b"></span>');
    } else if (schedule.location) {
      html.push('<span class="calendar-font-icon ic-location-b"></span>');
    }
    html.push('<em>"' + schedule.title + '"</em> ');
    html.push('@ <strong>' + schedule.calendarId + '</strong> ');
  }
  return html.join('');
}

function getDataAction(target) {
  return target.dataset
    ? target.dataset.action
    : target.getAttribute('data-action');
}

function setDropdownCalendarType(cal = window.calendar) {
  var calendarTypeName = document.getElementById('calendarTypeName');
  var calendarTypeIcon = document.getElementById('calendarTypeIcon');
  var options = cal.getOptions();
  var type = cal.getViewName();
  var iconClassName;

  if (type === 'day') {
    type = 'Daily';
    iconClassName = 'calendar-icon ic_view_day';
  } else if (type === 'week') {
    type = 'Weekly';
    iconClassName = 'calendar-icon ic_view_week';
  } else if (options.month.visibleWeeksCount === 2) {
    type = '2 weeks';
    iconClassName = 'calendar-icon ic_view_week';
  } else if (options.month.visibleWeeksCount === 3) {
    type = '3 weeks';
    iconClassName = 'calendar-icon ic_view_week';
  } else {
    type = 'Monthly';
    iconClassName = 'calendar-icon ic_view_month';
  }

  calendarTypeName.innerHTML = type;
  calendarTypeIcon.className = iconClassName;
}

export function onClickMenu(e, cal = window.calendar) {
  var target = $(e.target).closest('a[role="menuitem"]')[0];
  var action = getDataAction(target);
  var options = cal.getOptions();
  var viewName = '';

  switch (action) {
    case 'toggle-daily':
      viewName = 'day';
      break;
    case 'toggle-weekly':
      viewName = 'week';
      break;
    case 'toggle-monthly':
      options.month.visibleWeeksCount = 0;
      viewName = 'month';
      break;
    case 'toggle-weeks2':
      options.month.visibleWeeksCount = 2;
      viewName = 'month';
      break;
    case 'toggle-weeks3':
      options.month.visibleWeeksCount = 3;
      viewName = 'month';
      break;
    case 'toggle-narrow-weekend':
      options.month.narrowWeekend = !options.month.narrowWeekend;
      options.week.narrowWeekend = !options.week.narrowWeekend;
      viewName = cal.getViewName();

      target.querySelector('input').checked = options.month.narrowWeekend;
      break;
    case 'toggle-start-day-1':
      options.month.startDayOfWeek = options.month.startDayOfWeek ? 0 : 1;
      options.week.startDayOfWeek = options.week.startDayOfWeek ? 0 : 1;
      viewName = cal.getViewName();

      target.querySelector('input').checked = options.month.startDayOfWeek;
      break;
    case 'toggle-workweek':
      options.month.workweek = !options.month.workweek;
      options.week.workweek = !options.week.workweek;
      viewName = cal.getViewName();

      target.querySelector('input').checked = !options.month.workweek;
      break;
    default:
      break;
  }

  cal.setOptions(options, true);
  cal.changeView(viewName, true);

  setDropdownCalendarType();
  setRenderRangeText();
  setSchedules();
}

function onClickNavi(e, cal = window.calendar) {
  var action = getDataAction(e.target);

  switch (action) {
    case 'move-prev':
      cal.prev();
      break;
    case 'move-next':
      cal.next();
      break;
    case 'move-today':
      cal.today();
      break;
    default:
      return;
  }

  setRenderRangeText();
  setSchedules();
}

function setRenderRangeText(cal = window.calendar) {
  var renderRange = document.getElementById('renderRange');
  var options = cal.getOptions();
  var viewName = cal.getViewName();
  var html = [];
  if (viewName === 'day') {
    html.push(moment(cal.getDate().getTime()).format('YYYY.MM.DD'));
  } else if (
    viewName === 'month' &&
    (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)
  ) {
    html.push(moment(cal.getDate().getTime()).format('YYYY.MM'));
  } else {
    html.push(moment(cal.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
    html.push(' ~ ');
    html.push(moment(cal.getDateRangeEnd().getTime()).format(' MM.DD'));
  }
  renderRange.innerHTML = html.join('');
}

function setSchedules(cal = window.calendar) {
  // cal.clear();
  // generateSchedule(
  //   cal.getViewName(),
  //   cal.getDateRangeStart(),
  //   cal.getDateRangeEnd(),
  // );
  // cal.createSchedules(ScheduleList);
  // refreshScheduleVisibility();
}

// function refreshScheduleVisibility() {
//   var calendarElements = Array.prototype.slice.call(
//     document.querySelectorAll('#calendarList input'),
//   );

//   CalendarList.forEach(function (calendar) {
//     cal.toggleSchedules(calendar.id, !calendar.checked, false);
//   });

//   cal.render(true);

//   calendarElements.forEach(function (input) {
//     var span = input.nextElementSibling;
//     span.style.backgroundColor = input.checked
//       ? span.style.borderColor
//       : 'transparent';
//   });
// }

export function setEventListener(resizeThrottled) {
  $('.dropdown-menu a[role="menuitem"]').on('click', onClickMenu);
  $('#menu-navi').on('click', onClickNavi);
  window.addEventListener('resize', resizeThrottled);
}
