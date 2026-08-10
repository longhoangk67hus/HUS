let studentCount = 0;
let editingRow = null;

function addOrUpdateStudent() {
    const name = document.getElementById('studentName').value;
    const dob = document.getElementById('dob').value;
    const subject = document.getElementById('subject').value;
    const course = document.getElementById('course').value;

    // Validate fields
    if (!name || !dob || !subject || !course) {
        alert("Vui lòng nhập đầy đủ thông tin Sinh Viên");
        return;
    }

    if (editingRow === null) {
        // Add new student
        studentCount++;
        const table = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();

        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        cell1.innerHTML = studentCount;
        cell2.innerHTML = name;
        cell3.innerHTML = dob;
        cell4.innerHTML = subject;
        cell5.innerHTML = course;

        // Add update and delete buttons in the "Action" column
        cell6.innerHTML = `
            <button onclick="editStudent(this)">✏️</button>
            <button onclick="deleteStudent(this)">🗑️</button>
        `;
    } else {
        // Update existing student
        editingRow.cells[1].innerHTML = name;
        editingRow.cells[2].innerHTML = dob;
        editingRow.cells[3].innerHTML = subject;
        editingRow.cells[4].innerHTML = course;

        // Reset button and editing state
        editingRow = null;
        document.getElementById('addOrUpdateBtn').innerHTML = 'Thêm';
    }

    // Clear input fields
    document.getElementById('studentName').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('course').value = '';
}

function editStudent(button) {
    // Get the row to edit
    const row = button.parentNode.parentNode;

    // Set form values from the row
    document.getElementById('studentName').value = row.cells[1].innerHTML;
    document.getElementById('dob').value = row.cells[2].innerHTML;
    document.getElementById('subject').value = row.cells[3].innerHTML;
    document.getElementById('course').value = row.cells[4].innerHTML;

    // Set editingRow to the current row
    editingRow = row;

    // Change button text to Update
    document.getElementById('addOrUpdateBtn').innerHTML = 'Update';
}

function deleteStudent(button) {
    // Confirm deletion
    if (confirm("Bạn có muốn xóa thông tin Sinh Viên này?")) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);

        // Update student count and reassign STT
        studentCount--;
        updateSTT();
    }
}

function updateSTT() {
    const table = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].cells[0].innerHTML = i + 1;
    }
}
