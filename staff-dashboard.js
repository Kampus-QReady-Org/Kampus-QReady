// ========================================
// BACKEND API
// ========================================

const API_BASE_URL = 'http://localhost:3000';

// ========================================
// LOAD QUEUE FROM BACKEND
// ========================================

async function loadQueue() {

    try {

        const response = await fetch(`${API_BASE_URL}/api/staff/queue`);

        if (!response.ok) {
            throw new Error('Failed to load queue');
        }

        const data = await response.json();

        console.log('Queue data:', data);

        const queueTableBody = document.getElementById('queueTableBody');

        queueTableBody.innerHTML = '';

        data.queue.forEach(student => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${student.ticket}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.position}</td>
                <td><span class="status waiting">Waiting</span></td>
                <td>
                    <button class="view-btn">View</button>
                    <button class="call-btn">Call</button>
                    <button class="cancel-btn">Cancel</button>
                </td>
            `;

            queueTableBody.appendChild(row);
        });

    } catch (error) {

        console.error('Error loading queue:', error);

    }
}
loadQueue();

// ========================================
// LOAD APPOINTMENTS FROM BACKEND
// ========================================

async function loadAppointments() {

    try {

        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `${API_BASE_URL}/api/staff/appointments?date=${today}`
        );

        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }

        const data = await response.json();

        console.log('Appointment data:', data);

        const appointmentTableBody =
            document.getElementById('appointmentTableBody');

        appointmentTableBody.innerHTML = '';

        data.appointments.forEach(appointment => {

            const row = document.createElement('tr');

            row.dataset.visitId = appointment.visitId;

            row.innerHTML = `

                <td>${today}</td>
                <td>${appointment.time}</td>
                <td>${appointment.firstName} ${appointment.lastName}</td>
                <td>
                    <span class="status ${appointment.status}">
                        ${appointment.status}
                    </span>
                </td>
                 <td>
                    <button class="small-btn appointment-reschedule-btn">
                        Reschedule
                    </button>

                    <button class="small-btn appointment-cancel-btn">
                        Cancel
                    </button>
                </td>
            `;

            appointmentTableBody.appendChild(row);
        });

    } catch (error) {

        console.error('Error loading appointments:', error);

    }
}

loadAppointments();

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

document.getElementById('queueTableBody').addEventListener('click', function (event) {

    if (event.target.classList.contains('view-btn')) {

        const row = event.target.closest('tr');

        const studentNumber = 'Not available';
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
    }
});
// ----------------------------------------
// CALL SPECIFIC STUDENT
// ----------------------------------------

let selectedCallRow = null;

document.getElementById('queueTableBody').addEventListener('click', function (event) {

    if (event.target.classList.contains('call-btn')) {

        selectedCallRow = event.target.closest('tr');

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
    }
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
            bo
        otstrap.Modal.getInstance(modalElement);

        modal.hide();
    }
});

// ----------------------------------------
// CANCEL STUDENT
// ----------------------------------------

let selectedCancelRow = null;

document.getElementById('queueTableBody').addEventListener('click', function (event) {

    if (event.target.classList.contains('cancel-btn')) {

        selectedCancelRow = event.target.closest('tr');

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
    }
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
// ========================================
// RESCHEDULE APPOINTMENT
// ========================================

let selectedRescheduleRow = null;

document.getElementById('appointmentTableBody')
    .addEventListener('click', function (event) {

        if (event.target.classList.contains('appointment-reschedule-btn')) {

            selectedRescheduleRow = event.target.closest('tr');

            const date =
                selectedRescheduleRow.cells[0].textContent.trim();

            const time =
                selectedRescheduleRow.cells[1].textContent.trim();

            const student =
                selectedRescheduleRow.cells[2].textContent.trim();

            document.getElementById('rescheduleStudent').textContent =
                student;

            document.getElementById('rescheduleDate').textContent =
                date;

            document.getElementById('rescheduleTime').textContent =
                time;

            const modal = new bootstrap.Modal(
                document.getElementById('rescheduleAppointmentModal')
            );

            modal.show();
        }
    });

// ========================================
// CONFIRM RESCHEDULE
// ========================================

document.getElementById('confirmRescheduleBtn')
    .addEventListener('click', function () {

        if (selectedRescheduleRow) {

            const newDate =
                document.getElementById('newAppointmentDate').value;

            const newTime =
                document.getElementById('newAppointmentTime').value;

            if (!newDate || !newTime) {
                alert('Please select a new date and time.');
                return;
            }

            selectedRescheduleRow.cells[0].textContent =
                newDate;

            selectedRescheduleRow.cells[1].textContent =
                newTime;

            const modalElement =
                document.getElementById(
                    'rescheduleAppointmentModal'
                );

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();
        }
    });


/// ========================================
// CANCEL APPOINTMENT
// ========================================

let selectedAppointmentCancelRow = null;

document.getElementById('appointmentTableBody')
    .addEventListener('click', function (event) {

        if (event.target.classList.contains('appointment-cancel-btn')) {

            selectedAppointmentCancelRow = event.target.closest('tr');

            const date =
                selectedAppointmentCancelRow.cells[0].textContent.trim();

            const time =
                selectedAppointmentCancelRow.cells[1].textContent.trim();

            const student =
                selectedAppointmentCancelRow.cells[2].textContent.trim();

            document.getElementById('cancelAppointmentStudent').textContent =
                student;

            document.getElementById('cancelAppointmentDate').textContent =
                date;

            document.getElementById('cancelAppointmentTime').textContent =
                time;

            const modal = new bootstrap.Modal(
                document.getElementById('cancelAppointmentModal')
            );

            modal.show();
        }
    });

// ========================================
// CONFIRM CANCEL APPOINTMENT
// ========================================

document.getElementById('confirmCancelAppointmentBtn')
    .addEventListener('click', function () {

        if (selectedAppointmentCancelRow) {

            selectedAppointmentCancelRow.remove();

            const modalElement =
                document.getElementById(
                    'cancelAppointmentModal'
                );

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();
        }
    });

// ========================================
// EDIT APPOINTMENT SLOT
// ========================================

let selectedAppointmentEditRow = null;

document.getElementById('appointmentTableBody')
    .addEventListener('click', function (event) {

        if (event.target.classList.contains('appointment-edit-btn')) {

            selectedAppointmentEditRow =
                event.target.closest('tr');

            const date =
                selectedAppointmentEditRow.cells[0].textContent.trim();

            const time =
                selectedAppointmentEditRow.cells[1].textContent.trim();

            document.getElementById('editAppointmentDate').textContent =
                date;

            document.getElementById('editAppointmentTime').textContent =
                time;

            const modal = new bootstrap.Modal(
                document.getElementById('editAppointmentModal')
            );

            modal.show();
        }
    });


// ========================================
// CONFIRM EDIT APPOINTMENT
// ========================================

document.getElementById('confirmEditAppointmentBtn')
    .addEventListener('click', function () {

        if (selectedAppointmentEditRow) {

            const newDate =
                document.getElementById('editAppointmentNewDate').value;

            const newTime =
                document.getElementById('editAppointmentNewTime').value;

            if (!newDate || !newTime) {
                alert('Please select a new date and time.');
                return;
            }

            selectedAppointmentEditRow.cells[0].textContent =
                newDate;

            selectedAppointmentEditRow.cells[1].textContent =
                newTime;

            const modalElement =
                document.getElementById('editAppointmentModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();
        }
    });

// ========================================
// REMOVE APPOINTMENT SLOT
// ========================================

let selectedAppointmentRemoveRow = null;

document.getElementById('appointmentTableBody')
    .addEventListener('click', function (event) {

        if (event.target.classList.contains('appointment-remove-btn')) {

            selectedAppointmentRemoveRow =
                event.target.closest('tr');

            const date =
                selectedAppointmentRemoveRow.cells[0].textContent.trim();

            const time =
                selectedAppointmentRemoveRow.cells[1].textContent.trim();

            document.getElementById('removeAppointmentDate').textContent =
                date;

            document.getElementById('removeAppointmentTime').textContent =
                time;

            const modal = new bootstrap.Modal(
                document.getElementById('removeAppointmentModal')
            );

            modal.show();
        }
    });


// ========================================
// CONFIRM REMOVE APPOINTMENT SLOT
// ========================================

document.getElementById('confirmRemoveAppointmentBtn')
    .addEventListener('click', function () {

        if (selectedAppointmentRemoveRow) {

            selectedAppointmentRemoveRow.remove();

            const modalElement =
                document.getElementById('removeAppointmentModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();
        }
    });

// ========================================
// ADD APPOINTMENT SLOT
// ========================================

const addAppointmentButton =
    document.getElementById('addAppointmentBtn');


addAppointmentButton.addEventListener('click', function () {

    const modal = new bootstrap.Modal(
        document.getElementById('addAppointmentModal')
    );

    modal.show();
});


// ========================================
// CONFIRM ADD APPOINTMENT SLOT
// ========================================

document.getElementById('confirmAddAppointmentBtn')
    .addEventListener('click', function () {

        const newDate =
            document.getElementById('newAppointmentSlotDate').value;

        const newTime =
            document.getElementById('newAppointmentSlotTime').value;

        if (!newDate || !newTime) {
            alert('Please select a date and time.');
            return;
        }

        const tableBody =
            document.getElementById('appointmentTableBody');

        const newRow =
            document.createElement('tr');

        newRow.innerHTML = `
            <td>${newDate}</td>
            <td>${newTime}</td>
            <td>—</td>
            <td><span class="status available">Available</span></td>
            <td>
                <button class="small-btn appointment-edit-btn">
                    Edit
                </button>

                <button class="small-btn appointment-remove-btn">
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(newRow);

        const modalElement =
            document.getElementById('addAppointmentModal');

        const modal =
            bootstrap.Modal.getInstance(modalElement);

        modal.hide();

        document.getElementById('newAppointmentSlotDate').value = '';
        document.getElementById('newAppointmentSlotTime').value = '';
    });

// ========================================
// SEARCH STUDENT
// ========================================

const searchStudentButton =
    document.getElementById('searchStudentBtn');

const studentSearchInput =
    document.getElementById('studentSearch');

const studentResultsBody =
    document.getElementById('studentResultsBody');

const noStudentFound =
    document.getElementById('noStudentFound');


searchStudentButton.addEventListener('click', function () {

    const searchValue =
        studentSearchInput.value.trim().toLowerCase();

    const studentRows =
        studentResultsBody.querySelectorAll('tr');

    let studentFound = false;

    studentRows.forEach(function (row) {

        const studentNumber =
            row.cells[0].textContent.trim().toLowerCase();

        const studentName =
            row.cells[1].textContent.trim().toLowerCase();

        if (
            studentNumber.includes(searchValue) ||
            studentName.includes(searchValue)
        ) {
            row.style.display = '';
            studentFound = true;
        } else {
            row.style.display = 'none';
        }
    });


    if (studentFound) {
        noStudentFound.style.display = 'none';
    } else {
        noStudentFound.style.display = 'block';
    }

});

// ========================================
// EDIT STUDENT
// ========================================

const studentEditButtons =
    document.querySelectorAll('#studentResultsBody .edit-btn');

let selectedStudentEditRow = null;

studentEditButtons.forEach(function (button) {

    button.addEventListener('click', function () {

        selectedStudentEditRow = button.closest('tr');

        const studentNumber =
            selectedStudentEditRow.cells[0].textContent.trim();

        const studentName =
            selectedStudentEditRow.cells[1].textContent.trim();

        document.getElementById('editStudentNumber').value =
            studentNumber;

        document.getElementById('editStudentName').value =
            studentName;

        document.getElementById('editStudentEmail').value =
            'student@nwu.ac.za';

        document.getElementById('editStudentContact').value =
            'Not available';

        const modal = new bootstrap.Modal(
            document.getElementById('editStudentModal')
        );

        modal.show();
    });
});

// ========================================
// SAVE STUDENT CHANGES
// ========================================

document.getElementById('saveStudentChangesBtn')
    .addEventListener('click', function () {

        if (selectedStudentEditRow) {

            const newStudentNumber =
                document.getElementById('editStudentNumber').value.trim();

            const newStudentName =
                document.getElementById('editStudentName').value.trim();

            if (!newStudentNumber || !newStudentName) {
                alert('Please enter the student number and name.');
                return;
            }

            selectedStudentEditRow.cells[0].textContent =
                newStudentNumber;

            selectedStudentEditRow.cells[1].textContent =
                newStudentName;

            const modalElement =
                document.getElementById('editStudentModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();
        }
    });