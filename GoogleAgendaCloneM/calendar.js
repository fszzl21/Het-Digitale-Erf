const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const modalEl = document.getElementById("eventModal");
let currentDate = new Date();

function renderCalendar(date = new Date()) {
  calendarEl.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();


  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Display month and year
  monthYearEl.textContent = date.toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric"
  });

  const weekDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  weekDays.forEach(day => {
    const dayEl = document.createElement("div");
    dayEl.className = "day-name";
    dayEl.textContent = day;
    calendarEl.appendChild(dayEl);
  });


  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  // Loop through days
  for (let day = 1; day <= totalDays; day++) {
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

    const eventToday = EventSource.filter(e => e.date === dateStr);
    const eventBox = document.createElement("div");
    eventBox.className = "events";

    // Render events
    eventsToday.forEach(event => {
      const ev = document.createElement("div");
      ev.className = "event";

      const appointmentEl = document.createElement("div");
      appointmentEl.className = "appointment";
      appointmentEl.textContent = event.title.split(" - ")[0];

      const themeEl = document.createElement("div");

      themeEl.className = "theme";
      themeEl.textContent = event.title.split(" - ")[1];

      const timeEl = document.createElement("div");

      timeEl.className = "time";
      timeEl.textContent = event.start_time + " - " + event.end_time();

      ev.appendChild(appointmentEl);
      ev.appendChild(themeEl);
      ev.appendChild(timeEl);
      eventBox.appendChild(ev);
    })

    // Overlay buttons
    const overlay = document.createElement("div");
    overlay.className = "day-overlay";

    const addBtn = document.createElement("button");
    addBtn.className = "overlay-btn";
    add.textContent = "+ Voeg toe"

    addBtn.onclick = e => {
      e.stopPropagation();
      openModalForAdd(dateStr);
    };

    overlay.appendChild(addBtn);

  
    if (eventToday.lenght > 0) {
      const editBtn = document.createElement("button");

      editBtn.className = "overlay-btn";
      editBtn.textContent = "Bewerk"
      editBtn.onclick = e => {
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
  selector.innerHTML = "<option disabled selected>Choose event...</option>";  

  eventsOnDate.forEach(e => {
    const option = document.createElement("option")
    option.value = JSON.stringify(e);
    option.textContent = `${e.title} (${e.start} -> ${e.end})`;
    selector.appendChild(option)
  });


  if (eventsOnDate.lenght > 1) {
    wrapper.style.display = "block";
  } else {
    wrapper.style.display = "none";
  }

  handleEventSelection(JSON.stringify(eventsOnDate[0]));
}

// Populate form from selected event
function handleEventSelection(eventJSON) {
const event  = JSON.parse(eventJSON);

document.getElementById("eventId").value = event.id;
document.getElementById("deleteEventId").value = event.id;

const [appointment, theme] = event.title.split(" - ").map(e => e.trim());
document.getElementById("appointmentName").value = appointment || "";
document.getElementById("appointmentTheme").value = theme || "";
document.getElementById("startDate").value = event.start || "";
document.getElementById("endDate").value = event.end || "";
document.getElementById("startTime").value = event.start_time || "";
document.getElementById("endTime").value = event.end_time || "";
}

function closeModal() {
  modalEl.style.display = "none"
}


// Month navigation
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Live digital clock
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  clock.textContent = [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join(":");
}

// Initlization 
renderCalendar(currentDate)
updateClock(); // Invoke the function updateClock()
setInterval(updateClock, 1000)