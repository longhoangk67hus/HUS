<?php
$sinhviens = [];
while(true) {
    echo "------Quản lý sinh viên--------\n";
    echo "1. Thêm mới sinh viên\n";
    echo "2. Xem sinh viên\n";
    echo "3. Cập nhật thông tin sinh viên\n";
    echo "4. Xoá sinh viên\n";
    echo "5. Thoát\n";
    echo "Chọn chức năng: ";
    $choice = trim(fgets(STDIN));

    switch($choice) {
        case 1:
            addStudent();
            break;
        case 2:
            showStudent();
            break;
        case 3: 
            updateStudent();
            break;
        case 4:
            deleteStudent();
            break;
        case 5:
            exitProgram();
        default:
            echo "Bạn cần chọn đúng chức năng\n";
            break;
    }
}


function addStudent() {
    global $sinhviens;

    // Validate Name
    while (true) {
        echo "1. Nhập tên sinh viên: ";
        $name = trim(fgets(STDIN));
        if (!empty($name)) {
            break;
        } else {
            echo "Tên không được để trống. Vui lòng nhập lại.\n";
        }
    }

    // Validate Date of Birth (yyyy-mm-dd)
    while (true) {
        echo "2. Nhập ngày sinh (yyyy-mm-dd): ";
        $dob = trim(fgets(STDIN));
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
            // Check if the date is valid
            $dateParts = explode('-', $dob);
            if (checkdate($dateParts[1], $dateParts[2], $dateParts[0])) {
                break;
            } else {
                echo "Ngày sinh không hợp lệ. Vui lòng nhập ngày sinh đúng.\n";
            }
        } else {
            echo "Ngày sinh phải theo định dạng yyyy-mm-dd. Vui lòng nhập lại.\n";
        }
    }

    // Validate Subject
    while (true) {
        echo "3. Nhập môn học: ";
        $subject = trim(fgets(STDIN));
        if (!empty($subject)) {
            break;
        } else {
            echo "Môn học không được để trống. Vui lòng nhập lại.\n";
        }
    }

    // Validate Class
    while (true) {
        echo "4. Nhập khoá học: ";
        $class = trim(fgets(STDIN));
        if (!empty($class)) {
            break;
        } else {
            echo "Khóa học không được để trống. Vui lòng nhập lại.\n";
        }
    }

    // Add the new student to the list
    $sinhviens[] = [$name, $dob, $subject, $class];
    echo "Thêm mới sinh viên thành công\n";
}

function showStudent() {
    global $sinhviens;
    if (empty($sinhviens)) {
        echo "Không có sinh viên nào trong danh sách\n";
        return;
    }
    printf("%-10s %-30s %-30s %-30s %-30s\n", "STT", "Họ Tên", "Ngày Sinh", "Môn Học", "Khóa");
    // echo str_repeat("-", 80) . "\n"; // Horizontal divider

    // Print student details
    foreach ($sinhviens as $index => $student) {
        printf(
            "%-10d %-28s %-28s %-28s %-28s\n",
            $index + 1,
            $student[0],
            $student[1],
            $student[2],
            $student[3]
        );
    }
}

function updateStudent() {
    global $sinhviens;
    if (empty($sinhviens)) {
        echo "Danh sách sinh viên rỗng\n";
        return;
    }

    showStudent();
    echo "Nhập số thứ tự của sinh viên cần sửa: ";
    $index = trim(fgets(STDIN)) - 1;
    
    if ($index < 0 || $index >= count($sinhviens)) {
        echo "Số thứ tự không hợp lệ\n";
        return;
    }

    // Get the current student data
    $currentStudent = $sinhviens[$index];

    // Validate Name (can be left empty if no change)
    echo "1. Nhập tên sinh viên (để trống nếu không thay đổi): ";
    $name = trim(fgets(STDIN));
    if (!empty($name)) {
        $currentStudent[0] = $name;
    }

    // Validate Date of Birth (yyyy-mm-dd format, can be left empty if no change)
    while (true) {
        echo "2. Nhập ngày sinh mới (yyyy-mm-dd, để trống nếu không thay đổi): ";
        $dob = trim(fgets(STDIN));
        if (empty($dob)) {
            break; // No change
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
            $dateParts = explode('-', $dob);
            if (checkdate($dateParts[1], $dateParts[2], $dateParts[0])) {
                $currentStudent[1] = $dob;
                break;
            } else {
                echo "Ngày sinh không hợp lệ. Vui lòng nhập lại.\n";
            }
        } else {
            echo "Ngày sinh phải theo định dạng yyyy-mm-dd. Vui lòng nhập lại.\n";
        }
    }

    // Validate Subject (can be left empty if no change)
    echo "3. Nhập môn học mới (để trống nếu không thay đổi): ";
    $subject = trim(fgets(STDIN));
    if (!empty($subject)) {
        $currentStudent[2] = $subject;
    }

    // Validate Class (can be left empty if no change)
    echo "4. Nhập khoá học mới (để trống nếu không thay đổi): ";
    $class = trim(fgets(STDIN));
    if (!empty($class)) {
        $currentStudent[3] = $class;
    }

    // Update the student in the array
    $sinhviens[$index] = $currentStudent;
    echo "Cập nhật thành công\n";
}


function deleteStudent() {
    global $sinhviens;
    if (empty($sinhviens)) {
        echo "Danh sách sinh viên rỗng\n";
        return;
    }
    showStudent();
    echo "Nhập số thứ tự của sinh viên cần xóa: ";
    $index = trim(fgets(STDIN)) - 1;
    if ($index < 0 || $index >= count($sinhviens)) {
        echo "Số thứ tự không hợp lệ\n";
        return;
    }
    array_splice($sinhviens, $index, 1);
    echo "Xoá sinh viên thành công\n";
}

function exitProgram() {
    echo "Thoát chương trình\n";
    exit;
}
?>
