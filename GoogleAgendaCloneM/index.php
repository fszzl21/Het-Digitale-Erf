<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendar Clone</title>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <header>
    <h1>Calendar Clone</h1>
  </header>

<!-- Clock --> 
  <div class="clock-container">
    <div id="clock"></div>
  </div>

  <!-- Kalender gedeelte -->
  <div class="calendar">
    <div class="navBtnContainer">
      <button class="navBtn"> Previous </button>
      <h2 id="monthYear" style="margin: 0"></h2>
      <button class="navBtn"> Next </button>
    </div>

    <div class="calenderGrid" id="calender"></div>
  </div>

  <!-- Add/Edit/Delete functie, dit zorgt voor dat je een afspraak kan selecteren -->
  <div class="modal" id="eventModal">
    <div class="modal-content">

      <div id="eventSelectorWrapper">
        <label for="eventSelector">
          <strong>Selecteer afspraak</strong>
        </label>
        <select id="eventSelector">
          <option disabled selected>Kies afspraak...</option>
        </select>
      </div>

      <!-- Hoofd form, dit zorgt voor dat je een afspraak kan maken -->
      <form method="POST" id="appointmentForm">
        <input type="hidden" name="action" id="formAction" value="add">
        <input type="hidden" name="event-id" id="eventId">

        <label for="appointmentName"> Afspraak naam: </label>
        <input type="text" name="appointment_name" id="appointmentName" required>

        <label for="appointmentTheme"> Afspraak onderwerp: </label>
        <input type="text" name="appointment_name" id="appointmentName" required>

        <label for="startDate"> Start datum: </label>
        <input type="date" name="start_date" id="startDate" required>

        <label for="endDate"> Eind datum: </label>
        <input type="date" name="end_date" id="endDate" required>

        <button type="submit"> Save </button>
      </form>

      <!-- Delete Form -->
      <form method="POST" onsubmit="return confirm('Ben je zeker om deze afspraak te verwijderen?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="event_id" id="deleteEventId">
        <button type="submit" class="submit-btn"> Verwijder </button>
      </form>

      <!-- Cancel Form -->
      <button type="button" class="submit-btn"> Annuleer </button>

    </div>
  </div>

  <script src="calender.js"></script>
</body>

</html>