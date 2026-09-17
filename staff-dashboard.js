
// ======================================== 
// STAFF DASHBOARD
//========================================

//Display the current date on the staff dashboard automatically
const dateElement = document.getElementById('currentDate');
const today = new Date();

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};
dateElement.textContent = today.toLocaleDateString('en-GB', options);
// ========================================
//LOGOUT
// ========================================

//Redirect the staff member to the Login page when they log out
const logoutButton = document.getElementById('logoutBtn');

logoutButton.addEventListener('click', function () {
    window.location.href = 'index.html';
});


// ========================================
// QUEUE BUTTONS
// ========================================

// ----------------------------------------
// VIEW STUDENT
// ----------------------------------------

const viewButtons = document.querySelectorAll('.view-btn');

viewButtons.forEach(function (button) {

    button.addEventListener('click', function () {

        const row = button.closest('tr');

        const studentNumber = row.cells[0].textContent.trim();
        const studentName = row.cells[1].textContent.trim();

        document.getElementById('viewStudentNumber').textContent =
            studentNumber;

        document.getElementById('viewStudentName').textContent =
            studentName;

        // Temporary information
        document.getElementById('viewStudentEmail').textContent =
            'student@nwu.ac.za';

        document.getElementById('viewStudentContact').textContent =
            'Not available';

        const modal = new bootstrap.Modal(
            document.getElementById('viewStudentModal')
        );

        modal.show();
    });
});


// ----------------------------------------
// CALL SPECIFIC STUDENT
// ----------------------------------------

const callButtons = document.querySelectorAll('.call-btn');

let selectedCallRow = null;

callButtons.forEach(function (button) {

    button.addEventListener('click', function () {

        selectedCallRow = button.closest('tr');

        const ticket = selectedCallRow.cells[0].textContent.trim();
        const studentName = selectedCallRow.cells[1].textContent.trim();

        document.getElementById('callStudentTicket').textContent =
            ticket;

        document.getElementById('callStudentName').textContent =
            studentName;

        const modal = new bootstrap.Modal(
            document.getElementById('callStudentModal')
        );

        modal.show();
    });
});


// Confirm Call
document.getElementById('confirmCallBtn').addEventListener('click', function () {

    if (selectedCallRow) {

        const statusCell = selectedCallRow.cells[3];

        statusCell.innerHTML =
            '<span class="status called">Called</span>';

        const modalElement =
            document.getElementById('callStudentModal');

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        modal.hide();
    }
});


// ----------------------------------------
// CANCEL STUDENT
// ----------------------------------------

const cancelButtons = document.querySelectorAll('.cancel-btn');

let selectedCancelRow = null;

cancelButtons.forEach(function (button) {

    button.addEventListener('click', function () {

        selectedCancelRow = button.closest('tr');

        const ticket = selectedCancelRow.cells[0].textContent.trim();
        const studentName = selectedCancelRow.cells[1].textContent.trim();

        document.getElementById('cancelStudentTicket').textContent =
            ticket;

        document.getElementById('cancelStudentName').textContent =
            studentName;

        const modal = new bootstrap.Modal(
            document.getElementById('cancelStudentModal')
        );

        modal.show();
    });
});


// Confirm Cancel
document.getElementById('confirmCancelBtn').addEventListener('click', function () {

    if (selectedCancelRow) {

        selectedCancelRow.remove();

        const modalElement =
            document.getElementById('cancelStudentModal');

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        modal.hide();
    }
});


// ----------------------------------------
// CALL NEXT STUDENT
// ----------------------------------------

const callNextButton =
    document.getElementById('callNextBtn');

let nextStudentRow = null;

callNextButton.addEventListener('click', function () {

    const queueRows =
        document.querySelectorAll('#queueTableBody tr');

    if (queueRows.length === 0) {
        alert('There are no students waiting in the queue.');
        return;
    }

    nextStudentRow = queueRows[0];

    const ticket =
        nextStudentRow.cells[0].textContent.trim();

    const studentName =
        nextStudentRow.cells[1].textContent.trim();

    document.getElementById('nextStudentTicket').textContent =
        ticket;

    document.getElementById('nextStudentName').textContent =
        studentName;

    const modal = new bootstrap.Modal(
        document.getElementById('callNextModal')
    );

    modal.show();
});


// Confirm Call Next
document.getElementById('confirmCallNextBtn').addEventListener('click', function () {

    if (nextStudentRow) {

        const statusCell =
            nextStudentRow.cells[3];

        statusCell.innerHTML =
            '<span class="status called">Called</span>';

        const modalElement =
            document.getElementById('callNextModal');

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        modal.hide();
    }
});