<?php
// include "D:/Workspace/HUS/Web/day07/database.php";
include '/Users/harryhoang/Documents/Workspace/HUS/WebProject/day07/database.php';
$studentName = '';
$dob = '';
$subject = '';
$course = '';
$avatar = '';
$isEditing = false;

// Check if we are editing an existing student
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $isEditing = true;

    // Fetch student data from db by id
    $sql = "SELECT * FROM SinhVien WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        $studentName = $student['studentName'];
        $dob = $student['dob'];
        $subject = $student['subject'];
        $course = $student['course'];
        $avatar = $student['avatar'];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản Lý Sinh Viên</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: lightgray;
        }

        h1 {
            text-align: center;
        }

        .form-container {
            display: flex;
            flex-direction: column;
        }

        label {
            display: inline-block;
            width: auto;
            margin-bottom: 5px;
        }

        input {
            padding: 5px;
            background-color: white;
            margin-bottom: 10px;
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

        .button-container {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Quản Lý Sinh Viên</h1>
    
    <form action="confirm.php" method="post" enctype="multipart/form-data"> 
    <?php if ($isEditing):?>
        <input type="hidden" name="id" value="<?php echo $id; ?>">
    <?php endif; ?>
        <div style="border: gainsboro 1px solid; padding: 15px; width: 600px; box-shadow: 1px 1px 1px 2px gainsboro; border-radius: 5px; background-color: white">
            <div class="form-container">
                <label for="studentName">Sinh Viên</label>
                <input class="border" type="text" id="studentName" name="studentName" placeholder="Nhập tên sinh viên" value="<?php echo htmlspecialchars($studentName); ?>" required>

                <label for="dob">Ngày Sinh</label>
                <input class="border" type="date" id="dob" name="dob" value="<?php echo htmlspecialchars($dob); ?>" required>

                <label for="subject">Môn Học</label>
                <input class="border" type="text" id="subject" name="subject" placeholder="Nhập tên môn học" value="<?php echo htmlspecialchars($subject); ?>" required>

                <label for="course">Khóa</label>
                <input class="border" type="text" id="course" name="course" placeholder="Nhập khóa học" value="<?php echo htmlspecialchars($course); ?>" required>
                
                <label for="avatar">Avatar</label>
                <input type="file" id="avatar" name="avatar" accept=".png, .jpg, .jpeg">
                <?php if ($isEditing && $avatar): ?>
                    <img src="<?php echo htmlspecialchars($avatar); ?>" alt="Avatar" style="width: 50px; height: 50px;">
                <?php endif; ?>
            </div>
            <button type="submit"><?php echo $isEditing ? 'Cập nhật' : 'Thêm'; ?></button>
        </div>
    </form>
</body>
</html>
