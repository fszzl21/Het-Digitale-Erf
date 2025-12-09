<?php

include "calendar.php";

?>

<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calendar Project</title>
  <meta name="description" content="My Own Calendar Project">

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>

<body>

  <!-- Success / Error Messages -->
  <?php if ($successMsg): ?>
    <div class="alert success"><?= $successMsg ?></div>
  <?php elseif ($errorMsg): ?>
    <div class="alert error"><?= $errorMsg ?></div>
  <?php endif; ?>

  <!-- Calendar -->
  <div class="calendar">
    <div class="nav-btn-container">
      <button onclick="changeMonth(-1)" class="nav-btn">⏮️</button>
      <h2 id="monthYear" style="margin: 0"></h2>
      <button onclick="changeMonth(1)" class="nav-btn">⏭️</button>
    </div>

    <div class="calendar-grid" id="calendar"></div>
  </div>

  <!-- Too Many Events popup -->
  <div class=TMEModal id="TMEmodal">
    <div class="TME">
      <button class=TMEClose onclick="closeTME()"></button>
      <div class=TMEContainer id="TMEContainer">

      </div>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal" id="eventModal">
    <div class="modal-content">

      <!-- Dropdown Selector -->
      <div id="eventSelectorWrapper" style="display: none;">
        <label for="eventSelector"><strong>Kies Afspraak:</strong></label>
        <select id="eventSelector" onchange="handleEventSelection(this.value)">
          <option disabled selected>Kies Afspraak...</option>
        </select>
      </div>

      <!-- Form -->
      <form method="POST" id="eventForm">
        <input type="hidden" name="action" id="formAction" value="add">
        <input type="hidden" name="event_id" id="eventId">

        <label for="appointmentName">Afspraak Naam:</label>
        <input type="text" name="appointment_name" id="appointmentName" required>

        <label for="appointmentTheme">Onderwerp:</label>
        <input type="text" name="appointment_theme" id="appointmentTheme" required>

        <label for="startDate">Start Datum:</label>
        <input type="date" name="start_date" id="startDate" required>

        <label for="endDate">Eind Datum:</label>
        <input type="date" name="end_date" id="endDate" required>

        <label for="startTime">Start Tijd:</label>
        <input type="time" name="start_time" id="startTime" required>

        <label for="endTime">End Tijd:</label>
        <input type="time" name="end_time" id="endTime" required>

        <button type="submit">Opslaan</button>
      </form>

      <!-- Delete -->
      <form method="POST" onsubmit="return confirm('Are you sure you want to delete this appointment?')">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="event_id" id="deleteEventId">
        <button type="submit" class="submit-btn">Verwijder</button>
      </form>

      <!-- Cancel -->
      <button type="button" class="submit-btn" onclick="closeModal()" style="background:#ccc">Annuleer</button>
    </div>
  </div>

  <!-- Calendar Logic -->
  <script>
    const events = <?= json_encode($eventsFromDB, JSON_UNESCAPED_UNICODE); ?>;
  </script>

  <script src="calendar.js"></script>

</body>

</html>