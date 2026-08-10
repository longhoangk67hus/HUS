<?php
// include "C:/xampp/htdocs/database.php";
include "/Applications/XAMPP/xamppfiles/htdocs/database.php";
 
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
            addStudent($conn);
            break;
        case 2:
            showStudent($conn);
            break;
        case 3: 
            updateStudent($conn);
            break;
        case 4:
            deleteStudent($conn);
            break;
        case 5:
            exitProgram();
        default:
            echo "Bạn cần chọn đúng chức năng\n";
            break;
    }
}


function addStudent($conn) {
    // Validate name
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
        $birthday = trim(fgets(STDIN));
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
            $dateParts = explode('-', $birthday);
            if (checkdate($dateParts[1], $dateParts[2], $dateParts[0])) {
                break;
            } else {
                echo "Ngày sinh không hợp lệ. Vui lòng nhập ngày sinh đúng.\n";
            }
        } else {
            echo "Ngày sinh phải theo định dạng yyyy-mm-dd. Vui lòng nhập lại.\n";
        }
    }
    

    // Validate Class
    while (true) {
        echo "4. Nhập khoá học: ";
        $course = trim(fgets(STDIN));
        if (!empty($course)) {
            break;
        } else {
            echo "Khóa học không được để trống. Vui lòng nhập lại.\n";
        }
    }
    // Insert new student into database
    $query = "INSERT INTO users (name, birthday, course) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sss', $name, $birthday, $course); 
    if ($stmt->execute()) {
        echo "Thêm mới sinh viên thành công\n";
    } else {
        echo "Lỗi khi thêm mới sinh viên: " . $stmt->error . "\n";
    }
}
function showStudent($conn) {
    $query = "SELECT * FROM users";
    $result = $conn->query($query);
    if ($result->num_rows > 0) {
        printf("%-10s %-30s %-30s %-30s\n", "STT", "Họ Tên", "Ngày Sinh", "Môn Học", "Khóa");
        while ($row = $result->fetch_assoc()) {
            printf(
                "%-10d %-28s %-28s %-28s\n",
                $row['id'],
                $row['name'],
                $row['birthday'],
                $row['course']
            );
        }
    } else {
        echo "Không có sinh viên nào trong danh sách\n";
    }
    if (!$result) {
        echo "Lỗi khi truy vấn dữ liệu: " . $conn ->  error . "\n";
    }
}

function updateStudent($conn) {
    showStudent($conn);
    echo "Nhập số thứ tự của sinh viên cần sửa: ";
    $id = trim(fgets(STDIN));

    $query = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo "Lỗi khi chuẩn bị truy vấn: " . $conn->error . "\n";
        return;
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows == 0) {
        echo "Sinh viên không tồn tại\n";
        return;
    }

    $currentStudent = $result->fetch_assoc();

    // Validate Name (can be left empty if no change)
    echo "1. Nhập tên sinh viên mới (để trống nếu không thay đổi): ";
    $name = trim(fgets(STDIN));
    if (!empty($name)) {
        $currentStudent['name'] = $name;
    }
    
    // Validate Date of Birth (yyyy-mm-dd format, can be left empty if no change)
    while (true) {
        echo "2. Nhập ngày sinh mới (yyyy-mm-dd, để trống nếu không thay đổi): ";
        $birthday = trim(fgets(STDIN));
        if (empty($birthday)) {
            break; // No change
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
            $dateParts = explode('-', $birthday);
            if (checkdate($dateParts[1], $dateParts[2], $dateParts[0])) {
                $currentStudent['birthday'] = $birthday;
                break;
            } else {
                echo "Ngày sinh không hợp lệ. Vui lòng nhập lại.\n";
            }
        } else {
            echo "Ngày sinh phải theo định dạng yyyy-mm-dd. Vui lòng nhập lại.\n";
        }
    }

    // Validate Course (can be left empty if no change)
    echo "4. Nhập khoá học mới (để trống nếu không thay đổi): ";
    $course = trim(fgets(STDIN));
    if (!empty($course)) {
        $currentStudent['course'] = $course;
    }

    // Now update the student in the database
    $updateQuery = "UPDATE users SET name = ?, birthday = ?, course = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    if (!$updateStmt) {
        echo "Lỗi khi chuẩn bị truy vấn cập nhật: " . $conn->error . "\n";
        return;
    }
    
    $updateStmt->bind_param('sssi', $currentStudent['name'], $currentStudent['birthday'], $currentStudent['course'], $id);

    if ($updateStmt->execute()) {
        echo "Cập nhật thành công\n";
    } else {
        echo "Lỗi khi cập nhật sinh viên: " . $updateStmt->error . "\n";
    }
}
function deleteStudent($conn) {
    showStudent($conn);
    echo "Nhập số thứ tự của sinh viên cần xoá: ";
    $id = trim(fgets(STDIN));

    $query = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo "Lỗi khi chuẩn bị truy vấn: " . $conn->error . "\n";
        return;
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows == 0) {
        echo "Sinh viên không tồn tại\n";
        return;
    }
    $stmt->close();
    $query = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "Xoá sinh viên thành công\n";
    } else {
        echo "Lỗi khi xoá sinh viên: " . $stmt->error . "\n";
    }
    $stmt->close();
}
function exitProgram() {
    echo "Chương trình kết thúc. Tạm biệt!\n";
    exit();
}