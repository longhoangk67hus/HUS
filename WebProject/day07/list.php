<?php
// include 'C:/xampp/htdocs/day07/database.php';
include '/Users/harryhoang/Documents/Workspace/HUS/WebProject/day07/database.php';
$sql = "SELECT * FROM users";
$result = $conn->query($sql);  
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danh sách sinh viên</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha384-k6RqeWeci5ZR/Lv4MR0sA0FfDOMW1elHfyRqoVjBliZyPjbhU4FXJ/XB/J+OUy7D" crossorigin="anonymous">

</head>
<style>
    * {
            background-color: whitesmoke;
        }

        body {
            font-family: Arial, sans-serif;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 {
            text-align: center;
        }

        .form-container {
            display: flex;
            flex-direction: column;
        }

        .font_size_text {
            font-size: 20px;
            background-color: white
        }

        label {
            display: inline-block;
            width: auto;
        }

        input {
            padding: 5px;
            background-color: white
        }

        .border {
            border: gray 1px solid;
            border-radius: 5px;
        }

        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }

        button:hover {
            background-color: #0056b3;
        }

        table {
            width: 640px;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table, th, td {
            border: 1px solid rgba(255, 255, 255, 0.77)
        ;
            padding: 10px;
            text-align: left;
        }

        th {
            background-color: #007bff;
            color: white;
        }
</style>
<body>
    <h1>Quản lý sinh viên</h1>
    <a href="register.php"><button>Thêm</button></a>
    <table id="studentTable">
        <thead>
        <tr>
            <th>STT</th>
            <th>Sinh Viên</th>
            <th>Avatar</th>
            <th>Ngày Sinh</th>
            <th>Môn Học</th>
            <th>Khóa</th>
            <th>Action</th>
        </tr>
        </thead>
        <tbody>
            <?php
            if ($result->num_rows > 0) {
                while ($student = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . $student['id'] . "</td>";
                    echo "<td>" . $student['studentName'] . "</td>";
                    echo "<td><img src='" . $student['avatar'] . "' alt='Avatar' width='50'></td>";
                    echo "<td>" . $student['birthday'] . "</td>";
                    echo "<td>" . $student['subject'] . "</td>";
                    echo "<td>" . $student['course'] . "</td>";
                    echo "<td>";
                    // Redirect to register.php with student id for editing
                    echo "<a href='register.php?id=" . $student['id'] . "'>Edit</a> | ";
                    echo "<a href='delete.php?id=" . $student['id'] . "' onclick=\"return confirm('Are you sure you want to delete this student?');\">Delete</a>";
                    echo "</td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='7'>Không có sinh viên nào.</td></tr>";
            }
            $conn->close();
            ?>
        </tbody>
    </table>
</body>
</html>