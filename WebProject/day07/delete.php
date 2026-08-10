<?php
// Include database connection
// include 'C:/xampp/htdocs/day07/database.php';
include '/Users/harryhoang/Documents/Workspace/HUS/WebProject/day07/database.php';
// Check if the 'id' parameter is set in the URL
if (isset($_GET['id'])) {
    // Get the 'id' parameter from the URL
    $id = $_GET['id'];

    // Prepare the SQL statement to delete the student record by ID
    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    

    // Execute the statement
    if ($stmt->execute()) {
        // If deletion is successful, redirect to list.php
        header("Location: list.php");
        exit();
    } else {
        // If an error occurred, display it
        echo "Error deleting student: " . $conn->error;
    }
} else {
    // If 'id' parameter is not found, redirect back to list.php
    header("Location: list.php");
    exit();
}
?>
