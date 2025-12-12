const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const modalEl = document.getElementById("eventModal");
const TMEmodal = document.getElementById("TMEmodal") // TME stands for TooManyEvents
const TMEel = document.getElementById("TMEContainer");
let currentDate = new Date();
let Visibility = true;
let miniNavTimeout;


// Generate Full Calendar View
function renderCalendar(date = new Date()) {
  // Clear the calendar
  calendarEl.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

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
            console.log("test~!")
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

function AddGeneralAppointment(e) {
  e.stopPropagation();
  openModalForAdd();
}

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
}

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
}

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
}

// Add New Appointment
function newAppointment() {
  addBtn.onclick = (e) => {
    e.stopPropagation();
    openModalForAdd(dateStr);
  };
}

// Close the Modal
function closeModal() {
  modalEl.style.display = "none";
}

// Close the TMEmodal
function closeTME() {
  TMEmodal.style.display = "none";
}

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
}

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
}

// Update MiniNavigationModalVisibility om Visibility state correct te zetten
function MiniNavigationModalVisibility() {
  if (Visibility === false) {
    openMiniNav();
  } else {
    closeMiniNav();
  }
}

// Navigate Between Months
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Run on Page Load
renderCalendar(currentDate);