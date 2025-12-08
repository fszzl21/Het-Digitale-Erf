<?php

include "connection.php";

$successMsg = '';
$errorMsg = '';
$eventsFromDB = [];

// Handle Add Appointment
if ((isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "POST") && (isset($_POST['action']) ? $_POST['action'] : '') === "add") {
    $appointment      = trim($_POST["appointment_name"] ?? '');
    $theme  = trim($_POST["appointment_theme"] ?? '');
    $start       = $_POST["start_date"] ?? '';
    $end         = $_POST["end_date"] ?? '';
    $startTime   = $_POST["start_time"] ?? '';
    $endTime     = $_POST["end_time"] ?? '';

    if ($appointment && $theme && $start && $end && $startTime && $endTime) {
        $stmt = $conn->prepare(
            "INSERT INTO appointments (appointment_name, appointment_theme, start_date, end_date, start_time, end_time) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("ssssss", $appointment, $theme, $start, $end, $startTime, $endTime);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=1");
        exit;
    } else {
        header("Location: " . $_SERVER["PHP_SELF"] . "?error=1");
        exit;
    }
}

// Handle Edit Appointment
if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['action'] ?? '') === "edit") {
    $id          = $_POST["event_id"] ?? null;
    $appointment      = trim($_POST["appointment_name"] ?? '');
    $theme  = trim($_POST["appointment_theme"] ?? '');
    $start       = $_POST["start_date"] ?? '';
    $end         = $_POST["end_date"] ?? '';
    $startTime   = $_POST["start_time"] ?? '';
    $endTime     = $_POST["end_time"] ?? '';

    if ($id && $appointment && $theme && $start && $end && $startTime && $endTime) {
        $stmt = $conn->prepare(
            "UPDATE appointments SET appointment_name = ?, appointment_theme = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ? 
             WHERE id = ?"
        );
        $stmt->bind_param("ssssssi", $appointment, $theme, $start, $end, $startTime, $endTime, $id);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=2");
        exit;
    } else {
        header("Location: " . $_SERVER["PHP_SELF"] . "?error=2");
        exit;
    }
}

// Handle Delete Appointment
if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['action'] ?? '') === "delete") {
    $id = $_POST["event_id"] ?? null;

    if ($id) {
        $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=3");
        exit;
    }
}

// Success & Error Messages
if (isset($_GET["success"])) {
    $successMsg = match ($_GET["success"]) {
        '1' => "Appointment added successfully",
        '2' => "Appointment updated successfully",
        '3' => "Appointment deleted successfully",
        default => ''
    };
}

if (isset($_GET["error"])) {
    $errorMsg = 'Error occurred. Please check your input.';
}

// Fetch Appointments from DB and spread by date
$result = $conn->query("SELECT * FROM appointments");

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $start = new DateTime($row["start_date"]);
        $end   = new DateTime($row["end_date"]);

        while ($start <= $end) {
            $eventsFromDB[] = [
                "id"          => $row["id"],
                "title"       => "{$row['appointment_name']} - {$row['appointment_theme']}",
                "date"        => $start->format('Y-m-d'),
                "start"       => $row["start_date"],
                "end"         => $row["end_date"],
                "start_time"  => $row["start_time"],
                "end_time"    => $row["end_time"],
            ];
            $start->modify('+1 day');
        }
    }
}

$conn->close();

?>