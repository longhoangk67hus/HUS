<?php
// Database configuration
$host = "localhost";
$dbname = "SinhVien";
$username = "root";
$password = "";

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    // Check for connection error
    if ($conn->connect_error) { // Correct this line
        die("Connection failed: " . $conn->connect_error . "\n"); // Use connect_error
    }
    echo "Connet sucessfully to database SinhVien\n";
    // Check if the database exists, and create if not
    $dbCheck = $conn->query("SHOW DATABASES LIKE '$dbname'");
    if ($dbCheck->num_rows == 0) {
        // Read the sinhvien.sql file
        $sqlFile = "path/to/sinhvien.sql"; // Provide the correct path to sinhvien.sql
        if (file_exists($sqlFile)) {
            $sqlContent = file_get_contents($sqlFile);
            // Split SQL commands by semicolon (;) for execution
            $sqlCommands = explode(';', $sqlContent);
            
            // Execute each SQL command
            foreach ($sqlCommands as $command) {
                if (!empty(trim($command))) {
                    if ($conn->query($command) === TRUE) {
                        echo "SQL command executed successfully\n";
                    } else {
                        echo "Error executing command: " . $conn->error . "\n";
                    }
                }
            }
        } else {
            echo "SQL file not found: " . $sqlFile . "\n";
        }
    } else {
        // Select the existing database
        $conn->select_db($dbname);
        echo "Using existing database: $dbname\n";
    }
} catch(Exception $e) {
    echo $e -> getMessage();
    exit();
}
?>