<?php

// 1. Connect to Local MySQL Server (using XAMPP)
$username = "root";
$conn = new mysqli("localhost", $username, "", "appointment_calendar");
$conn->set_charset("utf8mb4");