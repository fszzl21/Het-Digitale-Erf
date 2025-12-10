const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const modalEl = document.getElementById("eventModal");
const TMEmodal = document.getElementById("TMEmodal") // TME stands for TooManyEvents
const TMEel = document.getElementById("TMEContainer");
let currentDate = new Date();


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

          ev.addEventListener("click", () => {
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

      eventsToday.forEach((event) => {
        const ev = document.createElement("div");
        ev.className = "event";
        const appointmentEl = document.createElement("div");
        appointmentEl.className = "appointment";
        appointmentEl.textContent = event.title.split(" - ")[0];

        ev.appendChild(appointmentEl);
        TMEel.appendChild(ev);
        TMEmodal.style.display = "flex";

        ev.addEventListener("click", (e) => {
        e.stopPropagation();
        openModalForEdit(eventsToday); // OPEN WITH RIGHT EVENT, MAYBE FIND WAY TO INDENTIFY EVENT TO PARSE CORRECT EVENT.
      });
      })
    };

    // Overlay Buttons
    const overlay = document.createElement("div");
    overlay.className = "day-overlay";

    const addBtn = document.createElement("button");
    addBtn.className = "overlay-btn";
    addBtn.textContent = "Voeg toe";
    addBtn.onclick = (e) => {
      e.stopPropagation();
      openModalForAdd(dateStr);
    };
    overlay.appendChild(addBtn);

    if (eventsToday.length > 0) {
      const editBtn = document.createElement("button");
      editBtn.className = "overlay-btn";
      editBtn.textContent = "Pas aan";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openModalForEdit(eventsToday);
      };
      overlay.appendChild(editBtn);
    }

    cell.appendChild(overlay);
    cell.appendChild(eventBox);
    calendarEl.appendChild(cell);
  }
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

// Close the Modal
function closeModal() {
  modalEl.style.display = "none";
}

// Close the TMEmodal
function closeTME() {
  TMEmodal.style.display = "none";
}

// Navigate Between Months
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Run on Page Load
renderCalendar(currentDate);