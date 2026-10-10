// ========================================
// BACKEND API
// ========================================

const API_BASE_URL = 'http://localhost:3000';

// ========================================
// LOAD QUEUE FROM BACKEND
// ========================================

async function loadQueue() {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/api/staff/queue`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load queue');
        }

        const data = await response.json();

        console.log('Queue data:', data);

        // Update dashboard summary cards
        document.getElementById('studentsWaiting').textContent =
            data.queue.length;

        document.getElementById('nextTicket').textContent =
            data.queue.length > 0
                ? data.queue[0].ticket
                : '—';

        const queueTableBody = document.getElementById('queueTableBody');

        queueTableBody.innerHTML = '';

        data.queue.forEach(student => {

            const row = document.createElement('tr');

            row.dataset.visitId = student.visitId;
            row.dataset.studentNumber = student.studentNumber || 'Not available';

            const status = student.status || 'waiting';

            row.innerHTML = `
                <td>${student.ticket}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.position}</td>
                <td>
                    <span class="status ${status.toLowerCase()}">
                        ${status}
                    </span>
                </td>
                <td>
                    <button class="view-btn">View</button>
                    <button class="call-btn">Call</button>
                    <button class="cancel-btn">Cancel</button>
                    <button class="complete-btn">Complete</button>
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

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/api/staff/appointments?date=${today}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }

        const data = await response.json();

        console.log('Appointment data:', data);

        // Update dashboard appointment summary cards
        document.getElementById('appointmentsToday').textContent =
            data.appointments.length;

        document.getElementById('completedToday').textContent =
            data.appointments.filter(
                appointment => appointment.status.toLowerCase() === 'completed'
            ).length;

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
// LOGOUT
// ========================================

const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        // Clear the saved login information
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to the Login page
        window.location.href = "index.html";
    });
}

// ========================================
// QUEUE BUTTONS
// ========================================

// ----------------------------------------
// VIEW STUDENT
// ----------------------------------------


function showStudentDetails(row) {
    const studentNumber =
        row.dataset.studentNumber ||
        row.cells[0].textContent.trim();

    const studentName =
        row.dataset.studentName ||
        row.cells[1].textContent.trim();

    document.getElementById('viewStudentNumber').textContent =
        studentNumber || 'Not available';

    document.getElementById('viewStudentName').textContent =
        studentName || 'Not available';

    const queueNumber = row.dataset.queueNumber;
    const ticket = row.dataset.ticket;
    const position = row.dataset.position;
    const joinTime = row.dataset.joinTime;
    const appointmentTime = row.dataset.appointmentTime;
    const appointmentStatus = row.dataset.appointmentStatus;

    const detailsContainer = document.getElementById('viewStudentModal')
        .querySelector('.modal-body');

    // Remove any old queue or appointment details.
    const oldDetails = detailsContainer.querySelector('.student-extra-details');
    if (oldDetails) {
        oldDetails.remove();
    }

    const extraDetails = document.createElement('div');
    extraDetails.className = 'student-extra-details';

    function addDetail(label, value) {
        if (!value) return;

        const paragraph = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        paragraph.append(strong, document.createTextNode(value));
        extraDetails.appendChild(paragraph);
    }

    if (queueNumber) {
        addDetail('Queue Number', ticket || queueNumber);
        addDetail('Queue Position', position);
        addDetail('Joined Queue', joinTime);
    } else {
        addDetail('Appointment Time', appointmentTime);
        addDetail('Appointment Status', appointmentStatus);
    }

    detailsContainer.appendChild(extraDetails);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('viewStudentModal')
    );

    modal.show();
}

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
document.getElementById('confirmCallBtn').addEventListener('click', async function () {

    if (selectedCallRow) {

        const visitId = selectedCallRow.dataset.visitId;
        const token = localStorage.getItem('token');

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/staff/queue/${visitId}/call`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to call student'
                );
            }

            console.log('Student called:', data);

            const statusCell = selectedCallRow.cells[3];

            statusCell.innerHTML =
                '<span class="status called">Called</span>';

            const modalElement =
                document.getElementById('callStudentModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();

        } catch (error) {

            console.error('Error calling student:', error);

            alert('Unable to call the student.');
        }
    }
});
// ----------------------------------------
// CANCEL STUDENT
// ----------------------------------------

let selectedCancelRow = null;

document.getElementById('queueTableBody').addEventListener('click', async function (event) {

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

    if (event.target.classList.contains('complete-btn')) {

        const selectedCompleteRow = event.target.closest('tr');

        const visitId = selectedCompleteRow.dataset.visitId;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/staff/queue/${visitId}/complete`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to complete queue visit'
                );
            }

            console.log('Queue visit completed:', data);

            selectedCompleteRow.remove();

            document.getElementById('studentsWaiting').textContent =
                document.querySelectorAll('#queueTableBody tr').length;

            document.getElementById('nextTicket').textContent =
                document.querySelector('#queueTableBody tr td')?.textContent || '—';
        } catch (error) {
            console.error('Error completing queue visit:', error);
            alert('Unable to complete the queue visit.');
        }
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

    nextStudentRow = Array.from(queueRows).find(row => {
        const status = row.cells[3].textContent.trim().toLowerCase();
        return status === 'waiting';
    });

    if (!nextStudentRow) {
        alert('There are no students waiting in the queue.');
        return;
    }

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
document.getElementById('confirmCallNextBtn').addEventListener('click', async function () {

    if (nextStudentRow) {

        const visitId = nextStudentRow.dataset.visitId;
        const token = localStorage.getItem('token');

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/staff/queue/${visitId}/call`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Failed to call next student'
                );
            }

            console.log('Next student called:', data);

            const statusCell =
                nextStudentRow.cells[3];

            statusCell.innerHTML =
                '<span class="status called">Called</span>';

            const modalElement =
                document.getElementById('callNextModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            modal.hide();

        } catch (error) {

            console.error('Error calling next student:', error);

            alert('Unable to call the next student.');
        }
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
    .addEventListener('click', async function () {

        if (selectedAppointmentCancelRow) {

            const visitId =
                selectedAppointmentCancelRow.dataset.visitId;

            const token =
                localStorage.getItem('token');

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/staff/appointments/${visitId}/status`,
                    {
                        method: 'PATCH',

                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status: 'cancelled'
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || 'Failed to cancel appointment'
                    );
                }

                // Update the appointment status in the table
                const statusCell = selectedAppointmentCancelRow.cells[3];

                statusCell.innerHTML =
                    '<span class="status cancelled">cancelled</span>';

                const modalElement =
                    document.getElementById(
                        'cancelAppointmentModal'
                    );

                const modal =
                    bootstrap.Modal.getInstance(modalElement);

                modal.hide();

                console.log(
                    'Appointment cancelled:',
                    data
                );

            } catch (error) {

                console.error(
                    'Error cancelling appointment:',
                    error
                );

                alert(error.message);
            }
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
// PREVENT PAST APPOINTMENT SLOT DATES
// ========================================

const appointmentSlotDate =
    document.getElementById('newAppointmentSlotDate');

const currentDateSlot = new Date();

const year = currentDateSlot.getFullYear();
const month = String(currentDateSlot.getMonth() + 1).padStart(2, '0');
const day = String(currentDateSlot.getDate()).padStart(2, '0');

appointmentSlotDate.min = `${year}-${month}-${day}`;

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

        if (newTime < '08:00' || newTime > '16:30') {
            alert('Appointments must be between 08:00 and 16:30.');
            return;
        }

        if (newTime >= '12:00' && newTime < '13:00') {
            alert('Appointments cannot be scheduled between 12:00 and 13:00 because of lunch.');
            return;
        }

        // Prevent duplicate appointment slots
        const existingRows =
            document.querySelectorAll('#appointmentTableBody tr');

        const duplicateSlot = Array.from(existingRows).some(row => {
            const existingDate = row.cells[0].textContent.trim();
            const existingTime = row.cells[1].textContent.trim();

            return existingDate === newDate &&
                existingTime === newTime;
        });

        if (duplicateSlot) {
            alert('An appointment slot already exists for this date and time.');
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

let studentManagementList = [];

async function loadStudentManagement() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please log in before searching for students.');
        return;
    }

    try {
        const currentDate = [
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, '0'),
            String(new Date().getDate()).padStart(2, '0')
        ].join('-');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        const [queueResponse, appointmentResponse] =
            await Promise.all([
                fetch(`${API_BASE_URL}/api/staff/queue`, {
                    headers
                }),
                fetch(
                    `${API_BASE_URL}/api/staff/appointments?date=${currentDate}`,
                    { headers }
                )
            ]);

        if (!queueResponse.ok || !appointmentResponse.ok) {
            throw new Error(
                'Could not load students. Check your login and backend.'
            );
        }

        const queueData = await queueResponse.json();
        const appointmentData = await appointmentResponse.json();

        const queueStudents = (queueData.queue || []).map(student => ({
            ...student,
            studentNumber: student.studentNumber || '',
            name: student.name ||
                `${student.firstName || ''} ${student.lastName || ''}`.trim()
        }));

        const appointmentStudents =
            (appointmentData.appointments || []).map(student => ({
                ...student,
                studentNumber: student.studentNumber || '',
                name: student.name ||
                    `${student.firstName || ''} ${student.lastName || ''}`.trim()
            }));

        // Combine students and remove duplicates.
        const uniqueStudents = new Map();

        [...queueStudents, ...appointmentStudents].forEach(student => {
            const key = student.studentNumber
                ? student.studentNumber.toLowerCase()
                : student.name.toLowerCase();

            if (key) {
                uniqueStudents.set(key, student);
            }
        });

        studentManagementList = [...uniqueStudents.values()];

        // Show all students when the page loads.
        displayStudentResults(studentManagementList);

    } catch (error) {
        console.error('Student Management error:', error);
        alert(error.message || 'Unable to load students.');
    }
}

function displayStudentResults(students) {
    studentResultsBody.replaceChildren();

    students.forEach(student => {
        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = student.studentNumber || 'Not available';

        const nameCell = document.createElement('td');
        nameCell.textContent = student.name || 'Not available';

        const actionsCell = document.createElement('td');

        const viewButton = document.createElement('button');
        viewButton.type = 'button';
        viewButton.textContent = 'View';
        viewButton.className = 'view-btn';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';

        actionsCell.append(viewButton, ' ', editButton);
        row.append(numberCell, nameCell, actionsCell);

        // Keep the actual student record available for the next step.
        row.dataset.studentNumber = student.studentNumber || '';
        row.dataset.studentName = student.name || '';
        row.dataset.firstName = student.firstName || '';
        row.dataset.lastName = student.lastName || '';
        row.dataset.queueNumber = student.queueNumber ?? '';
        row.dataset.ticket = student.ticket || '';
        row.dataset.position = student.position ?? '';
        row.dataset.joinTime = student.joinTime || '';
        row.dataset.appointmentTime = student.time || '';
        row.dataset.appointmentStatus = student.status || '';

        studentResultsBody.appendChild(row);
    });

    noStudentFound.style.display =
        students.length === 0 ? 'block' : 'none';
}

// Live search: update results whenever the user types.
studentSearchInput.addEventListener('input', function () {
    const searchValue = studentSearchInput.value.trim().toLowerCase();

    const filteredStudents = studentManagementList.filter(student =>
        (student.studentNumber || '').toLowerCase().includes(searchValue) ||
        (student.name || '').toLowerCase().includes(searchValue)
    );

    displayStudentResults(filteredStudents);
});

// Keep the Search button working too.
searchStudentButton.addEventListener('click', function () {
    studentSearchInput.dispatchEvent(new Event('input'));
});

// Populate the table when the page opens.
loadStudentManagement();

// View Student from Student Management.
studentResultsBody.addEventListener('click', function (event) {
    const button = event.target.closest('.view-btn');

    if (button && studentResultsBody.contains(button)) {
        showStudentDetails(button.closest('tr'));
    }
});

// View Student from the Queue table.
document.getElementById('queueTableBody').addEventListener(
    'click', function (event) {
        const button = event.target.closest('.view-btn');

        if (button && event.currentTarget.contains(button)) {
            showStudentDetails(button.closest('tr'));
        }
    }
);

// ========================================
// EDIT STUDENT
// ========================================

let selectedStudentEditRow = null;

studentResultsBody.addEventListener('click', function (event) {


    const button = event.target.closest('.edit-btn');

    if (!button || !studentResultsBody.contains(button)) {
        return;
    }

    selectedStudentEditRow = button.closest('tr');

    const studentNumber =
        selectedStudentEditRow.cells[0].textContent.trim();

    const studentName =
        selectedStudentEditRow.cells[1].textContent.trim();

    document.getElementById('editStudentNumber').value =
        studentNumber === 'Not available' ? '' : studentNumber;

    document.getElementById('editStudentName').value =
        studentName === 'Not available' ? '' : studentName;

    const modal = new bootstrap.Modal(
        document.getElementById('editStudentModal')
    );

    modal.show();
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

