const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const modalEl = document.getElementById("eventModal");
const TMEmodal = document.getElementById("TMEmodal"); // TME stands for TooManyEvents
const TMEel = document.getElementById("TMEContainer");
const realCurrentDay = new Date();
let currentDate = new Date();
let Visibility = true;
let miniNavTimeout;

var currentCalendarView = null; // Possible values: "month", "week", "day"

if (sessionStorage.getItem("calendarView")) {
  currentCalendarView = sessionStorage.getItem("calendarView");
} else {
  var currentCalendarView = "week";
};

// Render the Calendar based on current view
function renderCalendar() {
  if (currentCalendarView === "month") {
    renderMonthCalendar(currentDate);
  } else if (currentCalendarView === "week") {
    renderWeekCalendar(currentDate);
  } else if (currentCalendarView === "day") {
    renderDayCalendar(currentDate);
  }
};

// Switch to different calendar view
function switchCalendarView(viewType) {
  sessionStorage.setItem("calendarView", viewType);
  currentCalendarView = sessionStorage.getItem("calendarView");
  renderCalendar();
};

// Generate Month Calendar View
function renderMonthCalendar(date = new Date()) {
  // Clear the calendar
  calendarEl.innerHTML = "";

  calendarEl.style.display = "grid";
  calendarEl.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
  calendarEl.style.height = "100%";
  calendarEl.style.gridAutoRows = "1fr";
  calendarEl.style.gap = "10px";


  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Makes the h2 header change date and year
  monthYearEl.textContent = date.toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  weekDays.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "day-name";
    dayEl.textContent = day;
    calendarEl.appendChild(dayEl);
  });

  // Creating blank days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  // Creating the days
  for (let day = 1; day <= totalDays; day++) {
    let eventSwitch = false
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const cell = document.createElement("div");
    cell.className = "day";

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add("today");
    }

    const dateEl = document.createElement("div");
    dateEl.className = "date-number";
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    // When day div is clicked, will open new event modal
    cell.addEventListener("click", (e) => {
      e.stopPropagation();
      openModalForAdd(dateStr);
    })

    const eventsToday = events.filter((e) => e.date === dateStr);
    const eventBox = document.createElement("div");
    eventBox.className = "events";

    eventsToday.forEach((event) => {
      const ev = document.createElement("div");
      ev.className = "event";

      // If more than 2 events same day, "more events" event shows
      if (eventsToday.length > 1) {
        if (eventSwitch == false) {
          const tooManyEl = document.createElement("button");
          tooManyEl.className = "too-many-event";
          tooManyEl.textContent = "Nog " + eventsToday.length;

          ev.appendChild(tooManyEl);
          eventBox.appendChild(ev);

          ev.addEventListener("click", (e) => {
            e.stopPropagation();
            renderEventsTME();
          })

          eventSwitch = true
        }
      } else {

        const appointmentEl = document.createElement("div");
        appointmentEl.className = "appointment";
        appointmentEl.textContent = event.title.split(" - ")[0];

        ev.appendChild(appointmentEl);
        eventBox.appendChild(ev);

        ev.addEventListener("click", (e) => {
          e.stopPropagation();
          openModalForEdit(eventsToday);
        });
      }
    });

    // Display events on TME modal (TooManyEvents)
    function renderEventsTME() {
      TMEel.innerHTML = "";
      let eventsToday = events.filter((e) => e.date === dateStr);

      // Create events/appointments
      eventsToday.forEach((event) => {
        const ev = document.createElement("div");
        ev.className = "event";
        const appointmentEl = document.createElement("div");
        appointmentEl.className = "appointment";
        appointmentEl.textContent = event.title.split(" - ")[0];

        // Append appointment to event and display it
        ev.appendChild(appointmentEl);
        TMEel.appendChild(ev);
        TMEmodal.style.display = "flex";

        // Connect click method with TMEModal function.
        ev.addEventListener("click", (e) => {
          e.stopPropagation();
          eventsToday.forEach((event) => {
            if (event.title.split(" - ")[0] == ev.textContent) {
              openModalTMEForEdit(eventsToday, event);
            }
          });
        });
      })
    };
    cell.appendChild(eventBox);
    calendarEl.appendChild(cell);
  }
}
// This function calculates the top and height for the event timeslot.
function getEventPosition(startTime, endTime, dayStartHour = 0, dayEndHour = 24) {
  // This will split the time strings and convert them to variables 
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const dayTotalHours = dayEndHour - dayStartHour;

  // Convert time to minutes from day start
  const startMinutes = (startHour - dayStartHour) * 60 + startMin;
  const endMinutes = (endHour - dayStartHour) * 60 + endMin;

  // Calculate percentages (0-100%)
  const topPercent = ((startMinutes / (dayTotalHours * 60)) * 100);
  const heightPercent = ((endMinutes - startMinutes) / (dayTotalHours * 60)) * 100;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
  };
};




// Generate Week Calendar View
function renderWeekCalendar(date = new Date()) {
  calendarEl.innerHTML = "";
  calendarEl.style.display = "flex";
  calendarEl.style.flexDirection = "row";
  calendarEl.style.height = "100%";
  calendarEl.style.gap = "0px";
  calendarEl.style.position = "relative";
  calendarEl.style.paddingTop = "35px";

  // Makes the h2 header change date and year
  monthYearEl.textContent = date.toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  const timeUnitColumnEl = document.createElement("div");
  timeUnitColumnEl.className = "time-unit-column";
  calendarEl.appendChild(timeUnitColumnEl);

  // This will make the time units on the left side
  for (let i = 0; i < 24; i++) {
    const timeUnitEl = document.createElement("div");
    timeUnitEl.className = "time-unit";
    timeUnitEl.textContent = String(i).padStart(2, '0') + ':00';

    const timeUnitHeight = 100 / 24;
    timeUnitEl.style.height = `${timeUnitHeight}%`;
    timeUnitColumnEl.appendChild(timeUnitEl);
  }

  // This will create the day columns
  const weekDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  for (let i = 0; i < 7; i++) {

    // Makes the day column
    const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Always a Sunday
    const dayDate = new Date(date);
    dayDate.setDate(firstDayOfWeek + i);
    const dateStr = dayDate.toISOString().split('T')[0]; // dateStr = yyyy-mm-dd
    const dayColumn = document.createElement("div");
    dayColumn.className = "day-column";

    dayColumn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModalForAdd(dateStr);
    })

    // Checks if the day is in the same month as the currentDate
    if (dayDate.getFullYear() !== date.getFullYear()) { // true if weeks overlap from different years
      var yearOverlap = true;
    } else if (dayDate.getMonth() !== date.getMonth()) { // true if weeks overlap from different months
      var monthOverlap = true;
    }

    // Adds the day header
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header";
    dayHeader.textContent = weekDays[i] + " " + dateStr.split("-")[2]
    dayColumn.appendChild(dayHeader);

    // Adding extra color to weekend to separate from rest
    if (weekDays[i] === "Zo" || weekDays[i] === "Za") {
      dayColumn.style.background = "#e9e9e9ff";
    }

    // Give today's day a marker
    if (
      String(realCurrentDay.getFullYear()) === dateStr.split("-")[0] &&
      String(realCurrentDay.getMonth() + 1) === dateStr.split("-")[1].replace(/^0+/, "") && // The replace function removes leading zeros.
      String(realCurrentDay.getDate()) === dateStr.split("-")[2].replace(/^0+/, "")
    ) {
      dayColumn.style.background = "var(--primary-light)";
      dayHeader.style.fontWeight = "bold";
    }

    // Filter events for this day
    const dayEvents = events.filter(e => e.date === dateStr);

    // Create events for the day
    dayEvents.forEach(event => {
      const position = getEventPosition(event.start_time, event.end_time);

      const timeSlotEl = document.createElement("div"); // Creates timeslots
      timeSlotEl.className = "time-slot";
      timeSlotEl.style.position = "absolute";
      timeSlotEl.style.top = position.top;
      timeSlotEl.style.height = position.height;
      timeSlotEl.style.width = "95%";
      timeSlotEl.style.left = "5%";

      const eventEl = document.createElement("div"); // Creates event element
      eventEl.className = "event-week";
      eventEl.textContent = event.title.split(" - ")[0];
      eventEl.style.height = "100%";
      eventEl.style.margin = "0px";
      eventEl.addEventListener("click", (e) => { // Opens edit modal when click on event
        e.stopPropagation();
        openModalTMEForEdit(dayEvents, event);
      });

      timeSlotEl.appendChild(eventEl);
      dayColumn.appendChild(timeSlotEl);
    });

    /*if (dayEvents.length > 1) { // checks if more then 1 event on the same day
      if (doTheyOverlap(dayEvents)) { // checks if events have overlap on same time
        for (let counter = 0; counter < dayEvents.length; counter++) {
          //dayEvents[counter].style.backgroundColor = "red"; 
          console.log(dayEvents[counter]);
        }
      }
    }*/
    calendarEl.appendChild(dayColumn);
  }
  // If week overlap from different month then it will display the months of sunday and saturday in the week in the header.
  let overlapFirstDay = new Date(date);
  overlapFirstDay.setDate((overlapFirstDay.getDate() - date.getDay())); // overlapFirstDay is Sunday
  console.log(overlapFirstDay)

  let overlapLastDay = new Date(overlapFirstDay);
  overlapLastDay.setDate(overlapLastDay.getDate() + 6) // overlapLastDay is Saturday
  console.log(overlapLastDay)

  if (yearOverlap) { // if year also changes in week, do same as monthOverlap but add year
    console.log("Week overlaps different year");
    monthYearEl.textContent =
      overlapFirstDay.toLocaleDateString("nl-NL", {
        month: "long",
        year: "numeric", // <<<---
      }) + " | " + overlapLastDay.toLocaleDateString("nl-NL", {
        month: "long",
        year: "numeric",
      });

  } else if (monthOverlap) { // if month changes it will update the header
    console.log("Week overlaps different month");
    monthYearEl.textContent =
      overlapFirstDay.toLocaleDateString("nl-NL", {
        month: "long"
      }) + " | " + overlapLastDay.toLocaleDateString("nl-NL", {
        month: "long",
        year: "numeric",
      });
  };
};



// Generate Day Calendar View
function renderDayCalendar(date = new Date()) {
  calendarEl.innerHTML = "";

  calendarEl.style.display = "flex";
  calendarEl.style.flexDirection = "row";
  calendarEl.style.height = "100%";
  calendarEl.style.gap = "0px";
  calendarEl.style.position = "relative";
  calendarEl.style.paddingTop = "35px";

  const weekDays = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
  const dayDate = new Date(date);
  const dateStr = dayDate.toISOString().split('T')[0]; // dateStr = yyyy-mm-dd

  // Makes the h2 header change date and year
  monthYearEl.textContent = date.toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  }) + " | " + dateStr.split("-")[2] + " " + weekDays[dayDate.getDay()];

  const timeUnitColumnEl = document.createElement("div");
  timeUnitColumnEl.className = "time-unit-column";
  calendarEl.appendChild(timeUnitColumnEl);

  // This will make the time units on the left side
  for (let i = 0; i < 24; i++) {
    const timeUnitEl = document.createElement("div");
    timeUnitEl.className = "time-unit";
    timeUnitEl.textContent = String(i).padStart(2, '0') + ':00';

    const timeUnitHeight = 100 / 24;
    timeUnitEl.style.height = `${timeUnitHeight}%`;
    timeUnitColumnEl.appendChild(timeUnitEl);
  }
  // Makes the day column


  const dayColumn = document.createElement("div");
  dayColumn.className = "day-column";

  dayColumn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModalForAdd(dateStr);
  })

  // Give today's day a marker
  if (
    String(realCurrentDay.getFullYear()) === dateStr.split("-")[0] &&
    String(realCurrentDay.getMonth() + 1) === dateStr.split("-")[1].replace(/^0+/, "") && // The replace function removes leading zeros.
    String(realCurrentDay.getDate()) === dateStr.split("-")[2].replace(/^0+/, "")
  ) {
    dayColumn.style.background = "var(--primary-light)";
  }

  // Filter events for this day
  const dayEvents = events.filter(e => e.date === dateStr);

  // Create events for the day
  dayEvents.forEach(event => {
    const position = getEventPosition(event.start_time, event.end_time);

    const timeSlotEl = document.createElement("div"); // Creates timeslots
    timeSlotEl.className = "time-slot";
    timeSlotEl.style.position = "absolute";
    timeSlotEl.style.top = position.top;
    timeSlotEl.style.height = position.height;
    timeSlotEl.style.width = "95%";
    timeSlotEl.style.left = "5%";

    const eventEl = document.createElement("div"); // Creates event element
    eventEl.className = "event-week";
    eventEl.textContent = event.title.split(" - ")[0];
    eventEl.style.height = "100%";
    eventEl.style.margin = "0px";
    eventEl.addEventListener("click", (e) => { // Opens edit modal when click on event
      e.stopPropagation();
      openModalTMEForEdit(dayEvents, event);
    });

    timeSlotEl.appendChild(eventEl);
    dayColumn.appendChild(timeSlotEl);
  });

  /*if (dayEvents.length > 1) { // checks if more then 1 event on the same day
    if (doTheyOverlap(dayEvents)) { // checks if events have overlap on same time
      for (let counter = 0; counter < dayEvents.length; counter++) {
        //dayEvents[counter].style.backgroundColor = "red"; 
        console.log(dayEvents[counter]);
      }
    }
  }*/
  calendarEl.appendChild(dayColumn);
};

/* function doTheyOverlap(dayEvents) { // checks if events on given day have overlap on same time
  let answer = false;

  for (let i = 0; i < dayEvents.length; i++) {
    for (let j = i + 1; j < dayEvents.length; j++) {
      const event1 = dayEvents[i];
      const event2 = dayEvents[j];

      const start1 = new Date(`1970-01-01T${event1.start_time}`);
      const end1 = new Date(`1970-01-01T${event1.end_time}`);
      const start2 = new Date(`1970-01-01T${event2.start_time}`);
      const end2 = new Date(`1970-01-01T${event2.end_time}`);

      if (start2 < end1 && start1 < end2) {
        answer = true;
        break;
      }
    }
    if (answer) break;
  }

  return answer;
} */

function AddGeneralAppointment(e) { // Opens add appointment modal
  e.stopPropagation();
  openModalForAdd();
};

// Add Event Modal
function openModalForAdd(dateStr) {
  document.getElementById("formAction").value = "add";
  document.getElementById("eventId").value = "";
  document.getElementById("deleteEventId").value = "";
  document.getElementById("appointmentName").value = "";
  document.getElementById("appointmentTheme").value = "";
  document.getElementById("startDate").value = dateStr;
  document.getElementById("endDate").value = dateStr;
  document.getElementById("startTime").value = "09:00";
  document.getElementById("endTime").value = "10:00";

  const selector = document.getElementById("eventSelector");
  const wrapper = document.getElementById("eventSelectorWrapper");
  if (selector && wrapper) {
    selector.innerHTML = "";
    wrapper.style.display = "none";
  }

  modalEl.style.display = "flex";
};

// Edit Event Modal
function openModalForEdit(eventsOnDate) {
  document.getElementById("formAction").value = "edit";
  modalEl.style.display = "flex";

  const selector = document.getElementById("eventSelector");
  const wrapper = document.getElementById("eventSelectorWrapper");

  selector.innerHTML = "<option disabled selected>Kies afspraak...</option>";

  eventsOnDate.forEach((e) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(e);
    option.textContent = `${e.title} (${e.start} -> ${e.end})`;
    selector.appendChild(option);
  });

  if (eventsOnDate.length > 1) {
    wrapper.style.display = "block";
  } else {
    wrapper.style.display = "none";
  }

  handleEventSelection(JSON.stringify(eventsOnDate[0]));
};

// Edit Event TME Modal (Copy of above but changed so it can display info on TME extra modal event info popup)
function openModalTMEForEdit(eventsOnDate, event) {
  document.getElementById("formAction").value = "edit";
  modalEl.style.display = "flex";

  const selector = document.getElementById("eventSelector");
  const wrapper = document.getElementById("eventSelectorWrapper");

  selector.innerHTML = "<option disabled selected>Kies uit...</option>";

  eventsOnDate.forEach((e) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(e);
    option.textContent = `${e.title} (${e.start} -> ${e.end})`;
    selector.appendChild(option);
  });

  if (eventsOnDate.length > 1) {
    wrapper.style.display = "block";
  } else {
    wrapper.style.display = "none";
  }

  handleEventSelection(JSON.stringify(event))
};

//  Autofill the Form
function handleEventSelection(eventJSON) {
  const event = JSON.parse(eventJSON);

  document.getElementById("eventId").value = event.id;
  document.getElementById("deleteEventId").value = event.id;

  const [appointment, theme] = event.title.split(" - ").map((e) => e.trim());

  document.getElementById("appointmentName").value = appointment || "";
  document.getElementById("appointmentTheme").value = theme || "";
  document.getElementById("startDate").value = event.start || "";
  document.getElementById("endDate").value = event.end || "";
  document.getElementById("startTime").value = event.start_time || "";
  document.getElementById("endTime").value = event.end_time || "";
};

// Add New Appointment
function newAppointment() {
  addBtn.onclick = (e) => {
    e.stopPropagation();
    openModalForAdd(dateStr);
  };
};

// Close the Modal
function closeModal() {
  modalEl.style.display = "none";
};

// Close the TMEmodal
function closeTME() {
  TMEmodal.style.display = "none";
};

// Open miniNavMenu
function openMiniNav() {
  clearTimeout(miniNavTimeout);
  const miniNav = document.getElementById("miniNav");
  const miniNavArrow1 = document.getElementById("miniNavArrow1");
  const miniNavArrow2 = document.getElementById("miniNavArrow2");

  miniNav.style.transform = "translate(0, 0%)";
  const miniNavColor = document.getElementById("miniNavColor");
  miniNavColor.style.left = "0";
  miniNavColor.style.right = "0";

  miniNavArrow1.style.transform = "rotate(-180deg)";
  miniNavArrow2.style.transform = "rotate(180deg)";

  Visibility = true;
};

// Close miniNavMenu
function closeMiniNav() {
  clearTimeout(miniNavTimeout);
  miniNavTimeout = setTimeout(() => {
    const miniNav = document.getElementById("miniNav");
    const miniNavArrow1 = document.getElementById("miniNavArrow1");
    const miniNavArrow2 = document.getElementById("miniNavArrow2");

    miniNav.style.transform = "translate(0, 60%)";
    miniNavArrow1.style.transform = "rotate(0deg)";
    miniNavArrow2.style.transform = "rotate(0deg)";

    Visibility = false;
  }, 50);
};

// Update MiniNavigationModalVisibility om Visibility state correct te zetten
function MiniNavigationModalVisibility() {
  if (Visibility === false) {
    openMiniNav();
  } else {
    closeMiniNav();
  }
};
// Navigate Between dates
function changeDates(offset) {
  if (currentCalendarView === "month") {
    changeMonth(offset)
  } else if (currentCalendarView === "week") {
    changeWeek(offset)
  } else if (currentCalendarView === "day") {
    changeDay(offset)
  }
};

// Navigate Between Days
function changeDay(offset) {
  currentDate.setDate(currentDate.getDate() + offset);
  renderCalendar();
};

// Navigate Between Weeks
function changeWeek(offset) {
  currentDate.setDate(currentDate.getDate() + (7 * offset));
  renderCalendar();
};

// Navigate Between Months
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar();
};

// Run on Page Load
renderCalendar();