<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve form data
    $studentName = $_POST['studentName'];
    $dob = $_POST['dob'];
    $subject = $_POST['subject'];
    $course = $_POST['course'];

    // Handle file upload for avatar
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] == 0) {
        // Xử lý file avatar
        $avatar_name = $_FILES['avatar']['name'];
        $avatar_tmp_name = $_FILES['avatar']['tmp_name'];
        $avatar_folder = 'uploads/' . $avatar_name;

        // Tạo thư mục nếu chưa có
        if (!is_dir("uploads/")) {
            mkdir("uploads/", 0777, true);
        }

        // Di chuyển file tới thư mục đích
        move_uploaded_file($avatar_tmp_name, $avatar_folder);
    } else {
        $avatar_folder = '';  // Nếu không có file, bỏ trống đường dẫn avatar
    }
} else {
    header("Location: register.php");
    exit();
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
            background-color: whitesmoke;
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
    <h1>Xác nhận</h1>

    <form>
        <div style="border: gainsboro 1px solid; padding: 15px; width: 600px; box-shadow: 1px 1px 1px 2px gainsboro; border-radius: 5px; background-color: white">
            <div class="form-container">
                <label for="studentName">Sinh Viên</label>
                <input class="border" type="text" id="studentName" name="studentName" placeholder="Nhập tên sinh viên" value="<?php echo htmlspecialchars($studentName); ?>" required>

                <label for="avatar">Avatar</label>
                <?php if ($avatar_folder): ?>
                    <div style="text-align: center;">
                        <img src="<?php echo $avatar_folder; ?>" alt="Avatar" style="width: 150px; height: 150px; border-radius: 50%;  border: 2px solid blue">
                    </div>
                <?php else: ?>
                    <p><strong>Avatar:</strong> Không có ảnh đại diện</p>
                <?php endif; ?>


                <label for="dob">Ngày Sinh</label>
                <input class="border" type="date" id="dob" name="dob" value="<?php echo htmlspecialchars($dob); ?>" required>

                <label for="subject">Môn Học</label>
                <input class="border" type="text" id="subject" name="subject" placeholder="Nhập tên môn học" value="<?php echo htmlspecialchars($subject); ?>" required>

                <label for="course">Khóa</label>
                <input class="border" type="text" id="course" name="course" placeholder="Nhập khóa học" value="<?php echo htmlspecialchars($course); ?>" required>
            </div>

            <div class="button-container">
                <button type="button" id="btn-back">Sửa</button>
                <button type="button" style="background-color: #DC3545;">Xác nhận</button>
            </div>
        </div>
    </form>
    <script>
        document.getElementById('btn-back').addEventListener('click', function() {
            window.history.back()
        });
    </script>
</body>

</html>