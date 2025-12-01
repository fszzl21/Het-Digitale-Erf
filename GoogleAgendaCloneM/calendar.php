<?php

// We have to include the connection.php file to connect to the database
include "connection.php";

$successMsg = "";
$errorMsg = "";
$eventsFromDB = []; // Initialize a new array to store the fetched events

# Handle Add Appointment
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST["action"] ?? "") === "add") {
  
  
  $appointment = trim($_POST["appointment_name"] ?? "");
  $theme = trim($_POST["appointment_theme"] ?? "");
  $start = $_POST["start_date"] ?? "";
  $end = $_POST["end_date"] ?? "";

  if ($appointment && $theme && $start && $end) {
    $stmt = $conn->prepare(
      "INSERT INTO appointments (appointment_name, appointment_theme, start_date, end_date) VALUES (?, ?, ?, ?)"
    );

    $stmt->bind_param("ssss", $appointment, $theme, $start, $end);

    $stmt->execute();

    $stmt->close();

    header("Location: " . $_SERVER["PHP_SELF"] . "?success=1");
    exit;
  } else {
    header("Location: " . $_SERVER["PHP_SELF"] . "?error=1");
    exit;
  }
}

# Handle Edit Appointment
 if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST["action"] ?? "") === "edit") {
  
  $id = $_POST["event_id"] ?? null;
  $appointment = trim($_POST["appointment_name"] ?? "");
  $theme = trim($_POST["appointment_theme"] ?? "");
  $start = $_POST["start_date"] ?? "";
  $end = $_POST["end_date"] ?? "";

  if ($id && $appointment && $theme && $start && $end) {
    $stmt = $conn->prepare(
      "UPDATE appointments SET appointment_name = ?, appointment_theme = ?, start_date = ?, end_date = ? WHERE id = ?"
    );

    $stmt->bind_param("ssssi", $appointment, $theme, $start, $end, $id);

    $stmt->execute();

    $stmt->close();

    header("Location: " . $_SERVER["PHP_SELF"] . "?success=2");
    exit;
  } else {
    header("Location: " . $_SERVER["PHP_SELF"] . "?error=2");
  }
 }

 # Handle Delete Appointment
 if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST["action"] ?? "") === "delete") {
  $id = $_POST["event_id"] ?? null;

  if ($id) {
    $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
    header("Location: " . $_SERVER["PHP_SELF"] . "?success=3");
  }
 }

 # Success & Error Messages
if (isset($_GET["success"])) {
  $successMsg = match($_GET["success"]) {
    "1" => "Afspraak successvol toegevoegd.",
    "2" => "Afspraak successvol geüpdatet.",
    "3" => "Afspraak successvol verwijderd.",
    default => ''
  };
}

if (isset($_GET["error"])) {
  $errorMsg = "Er is een fout opgetreden. Bekijk uw invoer.";
}

// Fetch All Appointsments and Spread Over Date Range
$result = $conn->query("SELECT * FROM appointments");

if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $start = new DateTime($row["start_date"]);
    $end = new DateTime($row["end_date"]);

    while ($start <= $end) {
      $eventsFromDB[] = [
        "id" => $row["id"],
        "title" => "{$row['appointment_name']} - {$row["appointment_theme"]}",
        "date" => $start->format("Y-m-d"),
        "start" => $row["start_date"],
        "end" => $row["end_date"]
      ];

      $start->modify("+1 day");
    }
  }
}

$conn->close();

?>