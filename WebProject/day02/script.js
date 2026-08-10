let studentCount = 0;

function addStudent() {
    // Get input values
    const name = document.getElementById('studentName').value;
    const dob = document.getElementById('dob').value;
    const subject = document.getElementById('subject').value;
    const course = document.getElementById('course').value;

    // Validate fields
    if (!name || !dob || !subject || !course) {
        alert("Vui lòng nhập đầy đủ thông tin Sinh Viên");
        return;
    }

    // Increment student count for STT
    studentCount++;

    // Insert new row into the table
    const table = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);

    cell1.innerHTML = studentCount;
    cell2.innerHTML = name;
    cell3.innerHTML = dob;
    cell4.innerHTML = subject;
    cell5.innerHTML = course;

    // Clear input fields
    document.getElementById('studentName').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('course').value = '';
}
