// Simple Day Scheduler
// Author: Rene Malingre
// Date: 2023-04-07
// Description: A simple day scheduler that allows the user to enter events for each hour of the day.
// Cloned from https://github.com/coding-boot-camp/crispy-octo-meme
// The user can navigate to previous and future days using the navigation buttons.
// The current day is highlighted in the navigation buttons.
// The user can save the schedule to local storage and load it from local storage.
// Colours are used to indicate the status of each time block (past, present, future).
// The user can click on a time block to edit the event entry, and click a save button to save
// to local storage.

// =================================================================================================
// Classes
// =================================================================================================
// TimeStatus to hold constants for the status of a TimeBlock
// used to set class names for the time blocks
class TimeStatus {
  static Past = 'past';
  static Present = 'present';
  static Future = 'future';
}

// =================================================================================================
// TimeBlock
// Contains StartTime, EndTime, Schedule Entry
// Has a property to determine if the TimeBlock is in the past, present, or future
class TimeBlock {
  constructor(start, end, event) {
    this.startTime = start;
    this.endTime = end;
    this.eventEntry = event;
  }
  getTimeStatus() {
    // get the current date and time
    const now = dayjs();
    const start = dayjs(this.startTime);
    const end = dayjs(this.endTime);
    // compare the current date and time to the start and end times for the time block
    if (now.isBefore(start)) {
      return TimeStatus.Future;
    } else if (now.isAfter(end)) {
      return TimeStatus.Past;
    } else {
      return TimeStatus.Present;
    }
  }
  // update the event entry
  updateEvent(eventEntry) {
    // store the event entry that the user entered
    this.eventEntry = eventEntry;
  }
}

// =================================================================================================
// Schedule
// Contains a collection of TimeBlocks and the date they represent
// Parameters are the start and end date-times of the schedule (dayjs objects)
// Has a method to construct the TimeBlocks
class Schedule {
  constructor(startTime, endTime) {
    this.startTime = dayjs(startTime);
    this.endTime = dayjs(endTime);
    this.timeBlocks = [];
    this.constructTimeBlocks();
  }
  // public methods
  // call this if need to recreate the time blocks
  // need to ensure that the date, start and end times are set before calling this
  recreateTimeBlocks() {
    this.timeBlocks = [];
    this.constructTimeBlocks();
  }

  // create a time block for each hour between start and end time
  constructTimeBlocks() {
    // use dayjs to create a time block for each hour between start and end time
    const start = dayjs(this.startTime);
    const end = dayjs(this.endTime);
    // set the boundaries of the first time block
    let timeBlockStart = dayjs(start);
    let timeBlockEnd = start.add(1, 'hour').subtract(1, 'second');
    while (timeBlockEnd.isBefore(end)) {
      // create a new time block and add it to the collection
      this.timeBlocks.push(new TimeBlock(timeBlockStart, timeBlockEnd, ''));
      timeBlockStart = timeBlockStart.add(1, 'hour');
      timeBlockEnd = timeBlockStart.add(1, 'hour').subtract(1, 'second');
    };
  };

  // get the time block at the specified index
  getTimeBlock(index) {
    return this.timeBlocks[index];
  }

  // get the number of time blocks
  getTimeBlockCount() {
    return this.timeBlocks.length;
  }

  // get the time block that contains the specified time
  // parameter is the time to search for (dayjs object)
  // returns null if no time block contains the specified time
  getTimeBlockByTime(time) {
    // convert/clone the time parameter to a dayjs object
    const timeToFind = dayjs(time);
    // check if the time is within the schedule
    if (timeToFind.isBefore(this.startTime) || timeToFind.isAfter(this.endTime)) {
      return null;
    }
    // loop through the time blocks and return the one that contains the specified time
    for (let i = 0; i < this.timeBlocks.length; i++) {
      if (this.timeBlocks[i].startTime.isSameOrBefore(timeToFind) && this.timeBlocks[i].endTime.isSameOrAfter(timeToFind) ) {
        return this.timeBlocks[i];
      }
    }
    // if no match, the time block was not found, return null
    return null;
  }

  // display the schedule in the specified container
  renderSchedule(containerID) {
    // select the container from the provided name
    const container = $('#' + containerID);
    // clear the container
    container.html('');
    // loop through the time blocks and add them to the container
    for (let i = 0; i < this.timeBlocks.length; i++) {
      // create a new row, set some standard classes
      const row = $('<div>').addClass('row time-block');
      // set the id of the row to hour-<index>
      row.attr('id', 'hour-' + i);

      // create a new column for the time
      const timeCol = $('<div>').addClass('col-2 col-lg-1 hour text-center py-3');
      // set the text for the time column
      timeCol.text(this.timeBlocks[i].startTime.format('h a'));

      // create a new column for the event entry
      const eventCol = $('<textarea>').addClass('col-8 col-lg-10 description');
      // set the text for the event column
      eventCol.text(this.timeBlocks[i].eventEntry);

      // create a new column for the save button
      const saveCol = $('<button>').addClass('btn save-btn col-2 col-lg-1');
      // set the aria label for the save button
      saveCol.attr('aria-label', 'save');
      // create an italic tag for the save button
      const saveIcon = $('<i>').addClass('fas fa-save');
      // add the aria-hidden attribute to the save icon
      saveIcon.attr('aria-hidden', 'true');
      // add the save icon to the save button
      saveCol.append(saveIcon);

      // add the time column to the row
      row.append(timeCol);
      // add the event column to the row
      row.append(eventCol);
      // add the save column to the row
      row.append(saveCol);

      // set the background color of the row based on the time status of the time block
      if (this.timeBlocks[i].getTimeStatus() === TimeStatus.Past) {
        row.addClass('past');
      } else if (this.timeBlocks[i].getTimeStatus() === TimeStatus.Present) {
        row.addClass('present');
      } else {
        row.addClass('future');
      }

      // add the row to the container
      container.append(row);
    }
  }

  updateTimeColors() {
    // loop through the time blocks and update the background color of the row
    // if necessary (called by a timer to ensure the proper color is displayed)
    for (let i = 0; i < this.timeBlocks.length; i++) {
      // select the row for the time block
      const row = $('#hour-' + i);
      // remove the past, present and future classes

      // set the background color of the row based on the time status of the time block
      if (this.timeBlocks[i].getTimeStatus() === TimeStatus.Past) {
        if (!row.hasClass('past')) {
          row.removeClass('present future');
          row.addClass('past');
        }
      } else if (this.timeBlocks[i].getTimeStatus() === TimeStatus.Present) {
        if (!row.hasClass('present')) {
          row.removeClass('past future');
          row.addClass('present');
        }
      } else {
        if (!row.hasClass('future')) {
          row.removeClass('past present');
          row.addClass('future');
        }
      }
    }
  }

  // check if the schedule has any events
  // useful to avoid saving empty schedules
  hasEvents() {
    for (let i = 0; i < this.timeBlocks.length; i++) {
      if (this.timeBlocks[i].eventEntry !== '') {
        return true;
      }
    }
    return false;
  }

  // custom serialization methods
  serializeToJSON() {
    // serialize the schedule to JSON
    if (this.hasEvents()) {
      // only serialize the schedule if it has events
      const serialized = {
        startTime: this.startTime,
        endTime: this.endTime,
        timeBlocks: [],
      };
      for (let i = 0; i < this.timeBlocks.length; i++) {
        serialized.timeBlocks.push({
          startTime: this.timeBlocks[i].startTime,
          endTime: this.timeBlocks[i].endTime,
          eventEntry: this.timeBlocks[i].eventEntry,
        });
      }
      return serialized;
    } else {
      return null;
    }
  }
  // deserialize the schedule from JSON
  deserializeFromJSON(json) {
    this.startTime = dayjs(json.startTime);
    this.endTime = dayjs(json.endTime);
    this.timeBlocks = [];
    for (let i = 0; i < json.timeBlocks.length; i++) {
      this.timeBlocks.push(new TimeBlock(dayjs( json.timeBlocks[i].startTime), dayjs( json.timeBlocks[i].endTime), json.timeBlocks[i].eventEntry));
    }
  }
}

// =================================================================================================
// Diary
// Contains Schedules, representing the schedule for a particular day
// Contains Current Date displayed
// Has Methods to Load from LocalStorage, Save to LocalStorage, and Render a Schedule
class Diary {
  constructor() {
    this.currentDate = dayjs();
    this.schedules = [];
    this.startingHour = 9; // 9am to 10am is the first hour of the schedule
    this.endingHour = 18; // 5pm to 6pm is the last hour of the schedule
  }

  goToNextDay() {
    this.currentDate = this.currentDate.add(1, 'day');
    this.renderSchedule();
  }

  goToPreviousDay() {
    this.currentDate = this.currentDate.add(-1, 'day');
    this.renderSchedule();
  }

  goToToday() {
    this.currentDate = dayjs();
    this.renderSchedule();
  }

  // public methods
  // clear local storage for debugging
  clearLocalStorage() {
    localStorage.clear();
  }

  // load the diary from local storage
  loadFromLocalStorage() {
    // get the diary from local storage
    const diary = localStorage.getItem('diary');
    // if diary exists, deserialize it
    if (diary) {
      this.deserializeFromString(diary);
    }
  }

  // save the diary to local storage
  saveToLocalStorage() {
    // serialize the diary and save it to local storage
    localStorage.setItem('diary', JSON.stringify(this.serializeToJSON()));
  }

  // render the schedule for the current date
  renderSchedule() {
    // get the schedule for the current date
    const schedule = this.getScheduleByDate(this.currentDate);

    // show the current date
    const currentDay= $('#currentDay');
    currentDay.text(schedule.startTime.format('dddd, D MMMM, YYYY'));
    // highlight today's date
    if (this.currentDate.isSame(dayjs(), 'date')) {
      currentDay.removeClass('alert-dark');
      currentDay.addClass('alert-info');
      $('#date-today').prop('disabled', true);
    }
    else {
      currentDay.removeClass('alert-info');
      currentDay.addClass('alert-dark');
      $('#date-today').prop('disabled', false);
    }

    // tell this schedule to render itself within the schedule-container div
    schedule.renderSchedule('schedule-container');
    //
  }

  // ensure that the time colors are up to date as time passes
  updateTimeColors() {
    // get the schedule for the current date
    const schedule = this.getScheduleByDate(this.currentDate);
    schedule.updateTimeColors();
  }

  // get the schedule for the specified date
  // returns a newly constructed schedule if no schedule exists for the specified date
  getScheduleByDate(date) {
    // convert/clone the date parameter to a dayjs object
    const dateToFind = dayjs(date);
    // loop through the schedules and return the one that matches the specified date
    for (let i = 0; i < this.schedules.length; i++) {
      if (this.schedules[i].startTime.isSame(dateToFind, 'day')) {
        return this.schedules[i];
      }
    }
    // if no match, the schedule was not found, return a newly created schedule
    return this.createScheduleByDate(dateToFind);
  }

  // create a schedule for the specified date
  // returns the new schedule
  createScheduleByDate(date) {
    // convert/clone the date parameter to a dayjs object
    const dateToCreate = dayjs(date);
    // create a new schedule for the specified date
    const scheduleStart= dateToCreate.startOf('day').add(this.startingHour, 'hour');
    const scheduleEnd = dateToCreate.startOf('day').add(this.endingHour, 'hour');
    const schedule = new Schedule(scheduleStart, scheduleEnd);
    // add the schedule to the collection
    this.schedules.push(schedule);
    // return the new schedule
    return schedule;
  }

  // custom serialization methods
  serializeToJSON() {
    // convert schedules to JSON objects
    const serialized = {
      schedules: [],
    };
    // only serialize schedules that have events stored
    for (let i = 0; i < this.schedules.length; i++) {
      const schedule = this.schedules[i].serializeToJSON();
      if (schedule) {
        serialized.schedules.push(schedule);
      }
    }
    return serialized;
  }

  // deserialize the diary from a string
  deserializeFromString(diaryString) {
    // turn the string into an object
    const deserialized = JSON.parse(diaryString);
    this.schedules = [];
    // deserialize the schedules
    for (let i = 0; i < deserialized.schedules.length; i++) {
      const schedule = new Schedule();
      schedule.deserializeFromJSON(deserialized.schedules[i]);
      this.schedules.push(schedule);
    }
    // set the current date to today
    this.currentDate= dayjs();
  }
}
// =================================================================================================

// =================================================================================================
// Main Program
// Wrap all code that interacts with the DOM in a call to jQuery to ensure that
// the code isn't run until the browser has finished rendering all the elements
// in the html.
$(function() {
  // Global Variables
// Diary
  const diary = new Diary();

  // initialize the diary
  // diary.clearLocalStorage();
  diary.loadFromLocalStorage();

  // render the schedule for the current date
  diary.currentDate = dayjs();
  diary.renderSchedule();

  // Timer
  // create a timer to update the time colors every 2 minutes
  // in case the user leaves the page open for a long time
  // and the time colors (past, present future) get out of sync
  setInterval(function() {
    diary.updateTimeColors();
  }, 120000);

  // Event Handlers
  // when the user clicks one of the the save buttons, save the event to the
  // Diary.Schedule.TimeBlock, and save the diary to local storage
  $('#schedule-container').on('click', '.save-btn', function(event) {
    // get the id of the time-block that contains the button that was clicked
    const timeBlockId = $(this).parent().attr('id');
    // extract the index representing the hour from the id
    const hour = parseInt(timeBlockId.split('-')[1]);
    // get the schedule for the current date
    const schedule = diary.getScheduleByDate(diary.currentDate);
    // get the time block for the specified hour
    const timeBlock = schedule.getTimeBlock(hour);
    // get the user input from the textarea
    const userInput = $(this).siblings('textarea').val();
    // set the event entry for the time block
    // this triggers the event to serialise to local storage
    timeBlock.updateEvent(userInput);
    diary.saveToLocalStorage();
  });

  // when the user clicks one of the date navigation buttons, update the current
  // date and render the schedule for the new date, and give the user some
  // cues about if today's date is currently being displayed
  $('#date-navigation').on('click', '.date-nav-link', function(event) {
    // select the date navigation link that was clicked
    const dateNavLink = $(this).attr('id');
    switch (dateNavLink) {
      case 'date-prev':
        diary.goToPreviousDay();
        break;
      case 'date-today':
        diary.goToToday();
        break;
      case 'date-next':
        diary.goToNextDay();
        break;
      default:
        break;
    }
    return;
  });
});

