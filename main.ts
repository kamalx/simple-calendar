console.log(`main.js loaded`)
let app_state: any = {}

// Element cache
const calendar = document.querySelector('#calendar')
const monthNameDisplay = document.querySelector('#monthNameDisplay') as HTMLDivElement;
const weekdaysContainer = document.querySelector('#weekdays') as HTMLDivElement;

const newEventModal = document.querySelector('#newEventModal') as HTMLDivElement;
const viewEventModal = document.querySelector('#viewEventModal') as HTMLDivElement;
const backdrop = document.querySelector('#modalBackDrop') as HTMLDivElement;

const eventTitleInput = document.querySelector('#eventTitleInput') as HTMLInputElement;
const eventDetailsInput = document.querySelector('#eventDetailsInput') as HTMLTextAreaElement;
// Done element cache

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March',
                'April', 'May', 'June',
                'July', 'August', 'September',
                'October', 'November', 'December']

app_state.nav = 0;
app_state.clicked = null;
app_state.events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

function cleanup() {
  calendar.innerHTML = '';
  monthNameDisplay.innerHTML = '';
  weekdaysContainer.innerHTML = '';
}

function openModal(date: string) {

  backdrop.style.display = 'block';
  //--- modal wrangling done.
  const eventTitle = document.querySelector('#eventTitle') as HTMLHeadingElement;
  const eventDetails = document.querySelector('#eventDetails') as HTMLParagraphElement;

  app_state.clicked = date;
  // app_state.clicked is the date that was clicked, or null if no date was clicked.
  // This is useful for setting the modal content based on the date.
  // For example, if a date is clicked, we can pre-fill the modal with
  // the date information, such as the day, month, and year.
  // If no date is clicked, we can leave the modal empty or set it to
  // the current date.
  const DAY_EVENT_EXISTS = app_state.events.find((event: any) => event.date === app_state.clicked);
  if (DAY_EVENT_EXISTS) {
    console.log(`Event exists for date: ${app_state.clicked}`);
    // If an event exists for the clicked date...
    // for now, just close the modal and sheepishly look away
    const viewEventTitle = document.querySelector('#viewEventTitle') as HTMLHeadingElement;
    const viewEventDetails = document.querySelector('#viewEventDetails') as HTMLParagraphElement;
    const viewEventDate = document.querySelector('#viewEventDate') as HTMLParagraphElement;
    viewEventDate.innerText = DAY_EVENT_EXISTS.date; // Display the event date
    viewEventTitle.innerText = DAY_EVENT_EXISTS.title; // Display the event title
    viewEventDetails.innerText = DAY_EVENT_EXISTS.details; // Display the event details
    viewEventModal.style.display = 'block';
    backdrop.style.display = 'block';
    // closeModal();
  } else {
    newEventModal.style.display = 'block';
    eventTitle.innerText = `Add Event`;
    eventDetails.innerText = `Date: ${date}.`;
    console.log('Modal opened');
  }

}
function closeModal() {
  newEventModal.style.display = 'none';
  viewEventModal.style.display = 'none';
  backdrop.style.display = 'none';
  eventTitleInput.value = '';
  eventDetailsInput.value = '';
  app_state.clicked = null; // Reset clicked date
  console.log('Modal closed');
  load()
}

function saveEvent() {
  // Save the event to localStorage
  const title = eventTitleInput.value?.trim();
  const details = eventDetailsInput.value?.trim();
  const date = app_state.clicked;
  if (title && details && date) {
    eventTitleInput.classList.remove('error');
    eventDetailsInput.classList.remove('error');

    const event = { title, details, date };
    app_state.events.push(event);
    localStorage.setItem('events', JSON.stringify(app_state.events));
    closeModal();
  } else {
    if (!title) {
      eventTitleInput.classList.add('error');
    }
    if (!details) {
      eventDetailsInput.classList.add('error');
    }

    console.error('Please fill in all fields before saving the event.');
  }
}

function deleteEvent(date: string) {
  // Delete the event from localStorage
  const eventIndex = app_state.events.findIndex((event: any) => event.date === date);
  if (eventIndex !== -1) {
    app_state.events.splice(eventIndex, 1);
    localStorage.setItem('events', JSON.stringify(app_state.events));
    console.log(`Event on ${date} deleted.`);
    closeModal();
  } else {
    console.error(`No event found for date: ${date}`);
    closeModal();
  }
}


function load() {
  // let now = new Date(2021, 0, 1); // January 1, 2021
  let now = new Date(); // Current date

  if (app_state.nav !== 0) {
    // if date is greater than the total number of days in requested month,
    // then we need to adjust the date to a smaller number. safer to just set it to 1.
    // we can do better with some more checks, but this trick works.
    if (now.getDate() > 28) {
      now.setDate(1);
    }
    now.setMonth(now.getMonth() + app_state.nav);
  }

  cleanup();

  const _day = now.getDate()
  const _month = now.getMonth()
  const _monthName = months[_month]
  const _year = now.getFullYear()

  const firstDay = new Date(_year, _month, 1)
  const lastDay = new Date(_year, _month + 1, 0) // quirky!
  // go to the next month and get the 0th day, which is the last day of the previous month

  // const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = lastDay.getDate() // does the same thing as daysInMonth above

  // const day = firstDay.getDay() - 1; // no idea why i did this but it's not needed

  let date_options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: 'numeric'
  }

  const dateString = now.toLocaleDateString('en-IN', date_options);

  const paddingDays = firstDay.getDay()

  for(let day of weekdays) {
    let weekdayBox = document.createElement('div')
    weekdayBox.classList.add('weekday')
    weekdayBox.innerText = day.substring(0, 2) // Shorten to first two letters
    weekdayBox.title = day // Full name as tooltip
    weekdayBox.style.textAlign = 'center'
    weekdayBox.style.fontWeight = 'bold'
    weekdaysContainer.appendChild(weekdayBox)
  }

  for (let i = 1; i <= days + paddingDays; i++) {
    let daySquare = document.createElement('div')
    const clickedDate = `${i - paddingDays}/${_month + 1}/${_year}`; // Month is 0-indexed

    daySquare.classList.add('day')
    if (i > paddingDays) {
      daySquare.classList.add('active')
      let currentDay;
      daySquare.innerText = currentDay = `${i - paddingDays}`

      console.log(`Current day: ${currentDay}, Date: ${_day}`)
      if(currentDay.toString() === _day.toString() && app_state.nav === 0) {
        daySquare.id = 'today'
        daySquare.title = `Today: ${dateString}`; // Tooltip for today
      }

      const DAY_EVENT_EXISTS = app_state.events.find((event: any) => event.date === clickedDate);
      if (DAY_EVENT_EXISTS) {
        console.log(`Event exists for date: ${clickedDate}`);
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerText = DAY_EVENT_EXISTS.title; // Display the event title
        daySquare.appendChild(eventDiv)
        daySquare.classList.add('event_exists')
        // If an event exists for the clicked date...
        // daySquare.classList.add('event')
      }

      daySquare.addEventListener('click', (e) => {
        app_state.clicked = clickedDate; // Store the clicked date in app_state
        console.log(`Clicked date: ${clickedDate}`);
        openModal(clickedDate);
      });
    } else {
      daySquare.classList.add('padding')
    }

    calendar.appendChild(daySquare)
  }
  monthNameDisplay.innerText = `${_monthName} ${_year}`
}

function initButtons () {
  const prevMonthBtn = document.querySelector('#prevMonthBtn') as HTMLButtonElement;
  const nextMonthBtn = document.querySelector('#nextMonthBtn') as HTMLButtonElement;

  const saveEventBtn = document.querySelector('#saveEventBtn') as HTMLButtonElement;
  const cancelEventBtn = document.querySelector('#cancelEventBtn') as HTMLButtonElement;

  const editEventBtn = document.querySelector('#editEventBtn') as HTMLButtonElement;
  const deleteEventBtn = document.querySelector('#deleteEventBtn') as HTMLButtonElement;
  const closeViewEventBtn = document.querySelector('#closeViewEventBtn') as HTMLButtonElement;

  prevMonthBtn.addEventListener('click', () => {
    app_state.nav--;
    load();
    console.log(`Previous month button clicked, nav: ${app_state.nav}`);
  });

  nextMonthBtn.addEventListener('click', () => {
    app_state.nav++;
    load();
    console.log(`Next month button clicked, nav: ${app_state.nav}`);
  });

  saveEventBtn.addEventListener('click', () => {
    saveEvent();
    console.log('Save button clicked, event saved');
  });

  cancelEventBtn.addEventListener('click', () => {
    closeModal();
    console.log('Cancel button clicked, modal closed');
  });

  editEventBtn.addEventListener('click', () => {
    // Logic to edit the event
    console.log('Edit button clicked, coming soon :P');
  });

  deleteEventBtn.addEventListener('click', () => {
    // Logic to delete the event
    console.log('Delete button clicked, deleting event...');
    if (app_state.clicked) {
      deleteEvent(app_state.clicked);
    } else {
      console.error('No event to delete, clicked date is null');
    }
    closeModal();
    console.log('Event deleted, modal closed');
  });

  closeViewEventBtn.addEventListener('click', () => {
    closeModal();
    console.log('Close view event button clicked, modal closed');
  });

  return {prevMonthBtn, nextMonthBtn};
}

initButtons();
load();
