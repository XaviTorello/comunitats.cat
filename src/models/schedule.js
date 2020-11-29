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
