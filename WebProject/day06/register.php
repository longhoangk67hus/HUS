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
        <div style="border: gainsboro 1px solid; padding: 15px; width: 600px; box-shadow: 1px 1px 1px 2px gainsboro; border-radius: 5px; background-color: white">
            <div class="form-container">
                <label for="studentName">Sinh Viên</label>
                <input class="border" type="text" id="studentName" name="studentName" placeholder="Nhập tên sinh viên" value="<?php echo isset($_POST['studentName']) ? $_POST['studentName'] : ''; ?>" required>

                <label for="avatar">Avatar</label>
                <input class="border" type="file" id="avatar" name="avatar" accept=".png, .jpg, .jpeg" required>

                <label for="dob">Ngày Sinh</label>
                <input class="border" type="date" id="dob" name="dob" value="<?php echo isset($_POST['dob']) ? $_POST['dob'] : ''; ?>" required>

                <label for="subject">Môn Học</label>
                <input class="border" type="text" id="subject" name="subject" placeholder="Nhập tên môn học" value="<?php echo isset($_POST['subject']) ? $_POST['subject'] : ''; ?>" required>

                <label for="course">Khóa</label>
                <input class="border" type="text" id="course" name="course" placeholder="Nhập khóa học" value="<?php echo isset($_POST['course']) ? $_POST['course'] : ''; ?>" required>
            </div>

            <div class="button-container">
                <button type="submit">Thêm</button>
            </div>
        </div>
    </form>
</body>
</html>
