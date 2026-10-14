// ========================================
// BACKEND API
// ========================================

// ========================================
// LOAD QUEUE FROM BACKEND
// ========================================

let queueLoading = false;

async function loadQueue() {
  if (queueLoading) return;

  queueLoading = true;

  const queueTableBody = document.getElementById("queueTableBody");
  const studentsWaitingElement = document.getElementById("studentsWaiting");
  const nextTicketElement = document.getElementById("nextTicket");

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}/api/staff/queue`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load queue.");
    }

    if (!Array.isArray(data.queue)) {
      throw new Error("The server returned an unexpected queue response.");
    }

    queueTableBody.replaceChildren();

    data.queue.forEach((student) => {
      const row = document.createElement("tr");

      row.dataset.visitId = student.visitId ?? "";
      row.dataset.studentNumber = student.studentNumber || "";
      row.dataset.studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim();
      row.dataset.queueNumber = student.queueNumber ?? "";
      row.dataset.ticket = student.ticket || "";
      row.dataset.position = student.position ?? "";
      row.dataset.joinTime = student.joinTime || "";

      const ticketCell = document.createElement("td");
      ticketCell.textContent = student.ticket || "—";

      const nameCell = document.createElement("td");
      nameCell.textContent = row.dataset.studentName || "Not available";

      const positionCell = document.createElement("td");
      positionCell.textContent = student.position ?? "—";

      const statusCell = document.createElement("td");
      const statusLabel = document.createElement("span");
      statusLabel.className = "status waiting";
      statusLabel.textContent = "Waiting";
      statusCell.appendChild(statusLabel);

      const actionsCell = document.createElement("td");

      [
        ["view-btn", "View"],
        ["call-btn", "Call"],
        ["complete-btn", "Complete"],
      ].forEach(([className, label]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        actionsCell.appendChild(button);
        actionsCell.appendChild(document.createTextNode(" "));
      });

      row.append(ticketCell, nameCell, positionCell, statusCell, actionsCell);

      queueTableBody.appendChild(row);
    });

    studentsWaitingElement.textContent = data.queue.length;
    nextTicketElement.textContent = data.queue[0]?.ticket || "—";

    const errorElement = document.getElementById("queueLoadError");
    if (errorElement) errorElement.remove();
  } catch (error) {
    console.error("Error loading queue:", error);

    let errorElement = document.getElementById("queueLoadError");

    if (!errorElement) {
      errorElement = document.createElement("p");
      errorElement.id = "queueLoadError";
      errorElement.setAttribute("role", "alert");
      errorElement.style.color = "red";
      queueTableBody.parentElement.before(errorElement);
    }

    errorElement.replaceChildren();
    errorElement.appendChild(document.createTextNode(`${error.message} `));

    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", loadQueue);
    errorElement.appendChild(retryButton);
  } finally {
    queueLoading = false;
  }
}

loadQueue();
// ========================================
// LOAD APPOINTMENTS FROM BACKEND
// ========================================

async function loadAppointments() {
  try {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/staff/appointments?date=${today}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load appointments");
    }

    const data = await response.json();

    console.log("Appointment data:", data);

    // Update dashboard appointment summary cards
    document.getElementById("appointmentsToday").textContent =
      data.appointments.length;

    document.getElementById("completedToday").textContent =
      data.appointments.filter(
        (appointment) => appointment.status.toLowerCase() === "completed",
      ).length;

    const appointmentTableBody = document.getElementById(
      "appointmentTableBody",
    );

    appointmentTableBody.innerHTML = "";

    data.appointments.forEach((appointment) => {
      const row = document.createElement("tr");

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

                    ${
                      appointment.status.toLowerCase() === "scheduled"
                        ? `
                        <button class="small-btn appointment-no-show-btn">
                            Mark No-Show
                        </button>

                        <button class="small-btn appointment-cancel-btn">
                            Cancel
                        </button>
                    `
                        : "—"
                    }
                </td>
            `;

      appointmentTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
  }
}

loadAppointments();

// ========================================
// STAFF DASHBOARD
//========================================

//Display the current date on the staff dashboard automatically
const dateElement = document.getElementById("currentDate");
const today = new Date();

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
dateElement.textContent = today.toLocaleDateString("en-GB", options);

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
    row.dataset.studentNumber || row.cells[0]?.textContent.trim();

  const studentName =
    row.dataset.studentName || row.cells[1]?.textContent.trim();

  document.getElementById("viewStudentNumber").textContent =
    studentNumber || "Not available";

  document.getElementById("viewStudentName").textContent =
    studentName || "Not available";

  const detailsContainer = document
    .getElementById("viewStudentModal")
    .querySelector(".modal-body");

  // Clear details from the previous student.
  const oldDetails = detailsContainer.querySelector(".student-extra-details");

  if (oldDetails) oldDetails.remove();

  const extraDetails = document.createElement("div");
  extraDetails.className = "student-extra-details";

  function addDetail(label, value) {
    if (value === undefined || value === null || value === "") return;

    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;
    paragraph.append(strong, document.createTextNode(String(value)));
    extraDetails.appendChild(paragraph);
  }

  // Queue activity, when available.
  const queueNumber = row.dataset.queueNumber;
  const ticket = row.dataset.ticket;
  const position = row.dataset.position;
  const joinTime = row.dataset.joinTime;

  if (queueNumber || ticket || position || joinTime) {
    addDetail("Queue Ticket", ticket || queueNumber);
    addDetail("Queue Position", position);
    addDetail("Joined Queue", joinTime);
  } else {
    addDetail("Queue Activity", "No current queue details available");
  }

  // Appointment activity, when available.
  const appointmentTime = row.dataset.appointmentTime;
  const appointmentStatus = row.dataset.appointmentStatus;
  const appointmentVisitId = row.dataset.appointmentVisitId;

  if (appointmentTime || appointmentStatus) {
    addDetail("Appointment Time", appointmentTime);
    addDetail("Appointment Status", appointmentStatus);

    if (appointmentStatus.toLowerCase() === "scheduled" && appointmentVisitId) {
      const appointmentActions = document.createElement("div");
      appointmentActions.className = "student-appointment-actions";
      appointmentActions.dataset.appointmentVisitId = appointmentVisitId;
      appointmentActions.dataset.appointmentTime = appointmentTime || "";

      const noShowButton = document.createElement("button");
      noShowButton.type = "button";
      noShowButton.className = "small-btn appointment-no-show-btn";
      noShowButton.textContent = "Mark No-Show";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "small-btn appointment-cancel-btn";
      cancelButton.textContent = "Cancel Appointment";

      appointmentActions.append(noShowButton, " ", cancelButton);
      extraDetails.appendChild(appointmentActions);
    }
  } else {
    addDetail("Appointment Activity", "No appointment details available");
  }
  detailsContainer.appendChild(extraDetails);

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("viewStudentModal"),
  );

  modal.show();
}

// ----------------------------------------
// CALL SPECIFIC STUDENT
// ----------------------------------------

let selectedCallRow = null;

document
  .getElementById("queueTableBody")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("call-btn")) {
      selectedCallRow = event.target.closest("tr");

      const ticket = selectedCallRow.cells[0].textContent.trim();
      const studentName = selectedCallRow.cells[1].textContent.trim();

      document.getElementById("callStudentTicket").textContent = ticket;

      document.getElementById("callStudentName").textContent = studentName;

      const modal = new bootstrap.Modal(
        document.getElementById("callStudentModal"),
      );

      modal.show();
    }
  });

// Confirm Call
document
  .getElementById("confirmCallBtn")
  .addEventListener("click", async function () {
    if (!selectedCallRow) return;

    const visitId = selectedCallRow.dataset.visitId;
    const token = localStorage.getItem("token");
    const confirmButton = this;

    if (!visitId || !token) {
      alert(
        "Unable to call the student. Please check your session and try again.",
      );
      return;
    }

    confirmButton.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staff/queue/${visitId}/call`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to call student.");
      }

      console.log("Student called:", data);

      const modalElement = document.getElementById("callStudentModal");
      const modal = bootstrap.Modal.getInstance(modalElement);

      if (modal) modal.hide();

      selectedCallRow = null;

      // Reload the queue to reflect the backend's current state.
      await loadQueue();
    } catch (error) {
      console.error("Error calling student:", error);
      alert(error.message || "Unable to call the student.");
    } finally {
      confirmButton.disabled = false;
    }
  });

// ----------------------------------------
// COMPLETE QUEUE VISIT
// ----------------------------------------

document
  .getElementById("queueTableBody")
  .addEventListener("click", async function (event) {
    if (event.target.classList.contains("complete-btn")) {
      const selectedCompleteRow = event.target.closest("tr");
      if (!selectedCompleteRow) return;

      const visitId = selectedCompleteRow.dataset.visitId;
      const token = localStorage.getItem("token");

      if (!visitId || !token) {
        alert(
          "Unable to complete the visit. Please check your session and try again.",
        );
        return;
      }

      const completeButton = event.target;
      completeButton.disabled = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/staff/queue/${visitId}/complete`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to complete queue visit.");
        }

        console.log("Queue visit completed:", data);

        // Reload the queue and summary cards from the backend.
        await loadQueue();
      } catch (error) {
        console.error("Error completing queue visit:", error);
        alert(error.message || "Unable to complete the queue visit.");
      } finally {
        completeButton.disabled = false;
      }
    }
  });

// ----------------------------------------
// CALL NEXT STUDENT
// ----------------------------------------

const callNextButton = document.getElementById("callNextBtn");

let nextStudentRow = null;

callNextButton.addEventListener("click", function () {
  const queueRows = document.querySelectorAll("#queueTableBody tr");

  if (queueRows.length === 0) {
    alert("There are no students waiting in the queue.");
    return;
  }

  nextStudentRow = Array.from(queueRows).find((row) => {
    const status = row.cells[3].textContent.trim().toLowerCase();
    return status === "waiting";
  });

  if (!nextStudentRow) {
    alert("There are no students waiting in the queue.");
    return;
  }

  const ticket = nextStudentRow.cells[0].textContent.trim();

  const studentName = nextStudentRow.cells[1].textContent.trim();

  document.getElementById("nextStudentTicket").textContent = ticket;

  document.getElementById("nextStudentName").textContent = studentName;

  const modal = new bootstrap.Modal(document.getElementById("callNextModal"));

  modal.show();
});

// Confirm Call Next
document
  .getElementById("confirmCallNextBtn")
  .addEventListener("click", async function () {
    if (!nextStudentRow) return;

    const visitId = nextStudentRow.dataset.visitId;
    const token = localStorage.getItem("token");
    const confirmButton = this;

    if (!visitId || !token) {
      alert(
        "Unable to call the next student. Please check your session and try again.",
      );
      return;
    }

    confirmButton.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staff/queue/${visitId}/call`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to call next student.");
      }

      console.log("Next student called:", data);

      const modalElement = document.getElementById("callNextModal");
      const modal = bootstrap.Modal.getInstance(modalElement);

      if (modal) modal.hide();

      nextStudentRow = null;

      // Reload the queue to reflect the backend's current state.
      await loadQueue();
    } catch (error) {
      console.error("Error calling next student:", error);
      alert(error.message || "Unable to call the next student.");
    } finally {
      confirmButton.disabled = false;
    }
  });

// ========================================
// RESCHEDULE APPOINTMENT
// ========================================

let selectedRescheduleRow = null;

document
  .getElementById("appointmentTableBody")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("appointment-reschedule-btn")) {
      selectedRescheduleRow = event.target.closest("tr");

      const date = selectedRescheduleRow.cells[0].textContent.trim();

      const time = selectedRescheduleRow.cells[1].textContent.trim();

      const student = selectedRescheduleRow.cells[2].textContent.trim();

      document.getElementById("rescheduleStudent").textContent = student;

      document.getElementById("rescheduleDate").textContent = date;

      document.getElementById("rescheduleTime").textContent = time;

      const modal = new bootstrap.Modal(
        document.getElementById("rescheduleAppointmentModal"),
      );

      modal.show();
    }
  });

// ========================================
// CANCEL APPOINTMENT
// ========================================

let selectedAppointmentCancelRow = null;
let selectedAppointmentCancelVisitId = null;

document.addEventListener("click", function (event) {
  const button = event.target.closest(".appointment-cancel-btn");

  if (!button) return;

  const activityDetails = button.closest(".student-extra-details");
  const row = button.closest("#appointmentTableBody tr");

  if (activityDetails) {
    selectedAppointmentCancelRow = null;
    selectedAppointmentCancelVisitId =
      activityDetails.dataset.appointmentVisitId;

    const modal = document.getElementById("viewStudentModal");

    document.getElementById("cancelAppointmentStudent").textContent =
      modal.querySelector("#viewStudentName").textContent;

    document.getElementById("cancelAppointmentDate").textContent =
      new Date().toLocaleDateString();

    document.getElementById("cancelAppointmentTime").textContent =
      activityDetails.dataset.appointmentTime || "Not available";
  } else if (row) {
    selectedAppointmentCancelRow = row;
    selectedAppointmentCancelVisitId = row.dataset.visitId;

    document.getElementById("cancelAppointmentStudent").textContent =
      row.cells[2].textContent.trim();

    document.getElementById("cancelAppointmentDate").textContent =
      row.cells[0].textContent.trim();

    document.getElementById("cancelAppointmentTime").textContent =
      row.cells[1].textContent.trim();
  } else {
    return;
  }

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("cancelAppointmentModal"),
  ).show();
});

// ========================================
// CONFIRM CANCEL APPOINTMENT
// ========================================

document
  .getElementById("confirmCancelAppointmentBtn")
  .addEventListener("click", async function () {
    const visitId = selectedAppointmentCancelVisitId;
    const token = localStorage.getItem("token");
    const confirmButton = this;

    if (!visitId || !token) {
      alert(
        "Unable to cancel the appointment. Please check your session and try again.",
      );
      return;
    }

    confirmButton.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staff/appointments/${visitId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel appointment.");
      }

      console.log("Appointment cancelled:", data);

      const modalElement = document.getElementById("cancelAppointmentModal");

      bootstrap.Modal.getOrCreateInstance(modalElement).hide();

      selectedAppointmentCancelRow = null;
      selectedAppointmentCancelVisitId = null;

      // Refresh the backend data.
      await loadAppointments();
      await loadStudentManagement();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(error.message || "Unable to cancel the appointment.");
    } finally {
      confirmButton.disabled = false;
    }
  });

// ========================================
// MARK APPOINTMENT AS NO-SHOW
// ========================================

document.addEventListener("click", async function (event) {
  const button = event.target.closest?.(".appointment-no-show-btn");

  if (!button) return;

  const activityDetails = button.closest(".student-extra-details");
  const row = button.closest("#appointmentTableBody tr");

  const visitId = activityDetails
    ? activityDetails.dataset.appointmentVisitId
    : row?.dataset.visitId;

  const token = localStorage.getItem("token");

  if (!visitId || !token) {
    alert(
      "Unable to update the appointment. Please check your session and try again.",
    );
    return;
  }

  if (!confirm("Mark this appointment as a no-show?")) return;

  button.disabled = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/staff/appointments/${visitId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "no_show" }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update appointment status.");
    }

    console.log("Appointment marked as no-show:", data);

    await loadAppointments();
    await loadStudentManagement();

    if (activityDetails) {
      const modal = document.getElementById("viewStudentModal");
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
      modalInstance.hide();
    }
  } catch (error) {
    console.error("Error marking appointment as no-show:", error);
    alert(error.message || "Unable to update the appointment.");
  } finally {
    button.disabled = false;
  }
});

// ========================================
// EDIT APPOINTMENT SLOT
// ========================================

let selectedAppointmentEditRow = null;

document
  .getElementById("appointmentTableBody")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("appointment-edit-btn")) {
      selectedAppointmentEditRow = event.target.closest("tr");

      const date = selectedAppointmentEditRow.cells[0].textContent.trim();

      const time = selectedAppointmentEditRow.cells[1].textContent.trim();

      document.getElementById("editAppointmentDate").textContent = date;

      document.getElementById("editAppointmentTime").textContent = time;

      const modal = new bootstrap.Modal(
        document.getElementById("editAppointmentModal"),
      );

      modal.show();
    }
  });

// ========================================
// CONFIRM EDIT APPOINTMENT
// ========================================

document
  .getElementById("confirmEditAppointmentBtn")
  .addEventListener("click", function () {
    if (selectedAppointmentEditRow) {
      const newDate = document.getElementById("editAppointmentNewDate").value;

      const newTime = document.getElementById("editAppointmentNewTime").value;

      if (!newDate || !newTime) {
        alert("Please select a new date and time.");
        return;
      }

      selectedAppointmentEditRow.cells[0].textContent = newDate;

      selectedAppointmentEditRow.cells[1].textContent = newTime;

      const modalElement = document.getElementById("editAppointmentModal");

      const modal = bootstrap.Modal.getInstance(modalElement);

      modal.hide();
    }
  });

// ========================================
// REMOVE APPOINTMENT SLOT
// ========================================

let selectedAppointmentRemoveRow = null;

document
  .getElementById("appointmentTableBody")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("appointment-remove-btn")) {
      selectedAppointmentRemoveRow = event.target.closest("tr");

      const date = selectedAppointmentRemoveRow.cells[0].textContent.trim();

      const time = selectedAppointmentRemoveRow.cells[1].textContent.trim();

      document.getElementById("removeAppointmentDate").textContent = date;

      document.getElementById("removeAppointmentTime").textContent = time;

      const modal = new bootstrap.Modal(
        document.getElementById("removeAppointmentModal"),
      );

      modal.show();
    }
  });

// ========================================
// CONFIRM REMOVE APPOINTMENT SLOT
// ========================================

document
  .getElementById("confirmRemoveAppointmentBtn")
  .addEventListener("click", function () {
    if (selectedAppointmentRemoveRow) {
      selectedAppointmentRemoveRow.remove();

      const modalElement = document.getElementById("removeAppointmentModal");

      const modal = bootstrap.Modal.getInstance(modalElement);

      modal.hide();
    }
  });

// ========================================
// ADD APPOINTMENT SLOT
// ========================================

const addAppointmentButton = document.getElementById("addAppointmentBtn");

addAppointmentButton.addEventListener("click", function () {
  const modal = new bootstrap.Modal(
    document.getElementById("addAppointmentModal"),
  );

  modal.show();
});

// ========================================
// PREVENT PAST APPOINTMENT SLOT DATES
// ========================================

const appointmentSlotDate = document.getElementById("newAppointmentSlotDate");

const currentDateSlot = new Date();

const year = currentDateSlot.getFullYear();
const month = String(currentDateSlot.getMonth() + 1).padStart(2, "0");
const day = String(currentDateSlot.getDate()).padStart(2, "0");

appointmentSlotDate.min = `${year}-${month}-${day}`;

// ========================================
// CONFIRM ADD APPOINTMENT SLOT
// ========================================

document
  .getElementById("confirmAddAppointmentBtn")
  .addEventListener("click", function () {
    const newDate = document.getElementById("newAppointmentSlotDate").value;

    const newTime = document.getElementById("newAppointmentSlotTime").value;

    if (!newDate || !newTime) {
      alert("Please select a date and time.");
      return;
    }

    if (newTime < "08:00" || newTime > "16:30") {
      alert("Appointments must be between 08:00 and 16:30.");
      return;
    }

    if (newTime >= "12:00" && newTime < "13:00") {
      alert(
        "Appointments cannot be scheduled between 12:00 and 13:00 because of lunch.",
      );
      return;
    }

    // Prevent duplicate appointment slots
    const existingRows = document.querySelectorAll("#appointmentTableBody tr");

    const duplicateSlot = Array.from(existingRows).some((row) => {
      const existingDate = row.cells[0].textContent.trim();
      const existingTime = row.cells[1].textContent.trim();

      return existingDate === newDate && existingTime === newTime;
    });

    if (duplicateSlot) {
      alert("An appointment slot already exists for this date and time.");
      return;
    }

    const tableBody = document.getElementById("appointmentTableBody");

    const newRow = document.createElement("tr");

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

    const modalElement = document.getElementById("addAppointmentModal");

    const modal = bootstrap.Modal.getInstance(modalElement);

    modal.hide();

    document.getElementById("newAppointmentSlotDate").value = "";
    document.getElementById("newAppointmentSlotTime").value = "";
  });

// ========================================
// SEARCH STUDENT
// ========================================

const searchStudentButton = document.getElementById("searchStudentBtn");

const studentSearchInput = document.getElementById("studentSearch");

const studentResultsBody = document.getElementById("studentResultsBody");

const noStudentFound = document.getElementById("noStudentFound");

let studentManagementList = [];

async function loadStudentManagement() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in before searching for students.");
    return;
  }

  try {
    const currentDate = [
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, "0"),
      String(new Date().getDate()).padStart(2, "0"),
    ].join("-");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [queueResponse, appointmentResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/staff/queue`, {
        headers,
      }),
      fetch(`${API_BASE_URL}/api/staff/appointments?date=${currentDate}`, {
        headers,
      }),
    ]);

    if (!queueResponse.ok || !appointmentResponse.ok) {
      throw new Error("Could not load students. Check your login and backend.");
    }

    const queueData = await queueResponse.json();
    const appointmentData = await appointmentResponse.json();

    const queueStudents = (queueData.queue || []).map((student) => ({
      ...student,
      studentNumber: student.studentNumber || "",
      name:
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim(),
    }));

    const appointmentStudents = (appointmentData.appointments || []).map(
      (student) => ({
        ...student,
        studentNumber: student.studentNumber || "",
        name:
          student.name ||
          `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      }),
    );

    // Combine students while preserving queue and appointment activity.
    const uniqueStudents = new Map();

    queueStudents.forEach((student) => {
      const key = student.studentNumber
        ? student.studentNumber.toLowerCase()
        : student.name.toLowerCase();

      if (key) {
        uniqueStudents.set(key, {
          ...student,
          hasQueueActivity: true,
          hasAppointmentActivity: false,
        });
      }
    });

    appointmentStudents.forEach((student) => {
      const key = student.studentNumber
        ? student.studentNumber.toLowerCase()
        : student.name.toLowerCase();

      if (!key) return;

      const existingStudent = uniqueStudents.get(key);

      if (existingStudent) {
        uniqueStudents.set(key, {
          ...existingStudent,
          hasAppointmentActivity: true,
          appointmentVisitId: student.visitId ?? student.visit_id ?? "",
          appointmentTime: student.time || "",
          appointmentStatus: student.status || "",
        });
      } else {
        uniqueStudents.set(key, {
          ...student,
          appointmentVisitId: student.visitId ?? student.visit_id ?? "",
          hasQueueActivity: false,
          hasAppointmentActivity: true,
        });
      }
    });

    studentManagementList = [...uniqueStudents.values()];

    studentManagementList = [...uniqueStudents.values()];

    // Show all students when the page loads.
    displayStudentResults(studentManagementList);
  } catch (error) {
    console.error("Student Management error:", error);
    alert(error.message || "Unable to load students.");
  }
}

function displayStudentResults(students) {
  studentResultsBody.replaceChildren();

  students.forEach((student) => {
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.textContent = student.studentNumber || "Not available";

    const nameCell = document.createElement("td");
    nameCell.textContent = student.name || "Not available";

    const actionsCell = document.createElement("td");

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.textContent = "View Activity";
    viewButton.className = "view-activity-btn";

    actionsCell.append(viewButton);
    row.append(numberCell, nameCell, actionsCell);

    // Keep the actual student record available for the next step.
    row.dataset.studentNumber = student.studentNumber || "";
    row.dataset.studentName = student.name || "";
    row.dataset.firstName = student.firstName || "";
    row.dataset.lastName = student.lastName || "";
    row.dataset.queueNumber = student.queueNumber ?? "";
    row.dataset.ticket = student.ticket || "";
    row.dataset.position = student.position ?? "";
    row.dataset.joinTime = student.joinTime || "";
    row.dataset.appointmentTime = student.appointmentTime || student.time || "";

    row.dataset.appointmentStatus =
      student.appointmentStatus || student.status || "";

    row.dataset.appointmentVisitId =
      student.appointmentVisitId || student.visitId || "";

    studentResultsBody.appendChild(row);
  });

  noStudentFound.style.display = students.length === 0 ? "block" : "none";
}

// Live search: update results whenever the user types.
studentSearchInput.addEventListener("input", function () {
  const searchValue = studentSearchInput.value.trim().toLowerCase();

  const filteredStudents = studentManagementList.filter(
    (student) =>
      (student.studentNumber || "").toLowerCase().includes(searchValue) ||
      (student.name || "").toLowerCase().includes(searchValue),
  );

  displayStudentResults(filteredStudents);
});

// Keep the Search button working too.
searchStudentButton.addEventListener("click", function () {
  studentSearchInput.dispatchEvent(new Event("input"));
});

// Populate the table when the page opens.
loadStudentManagement();

/// View Student Activity from Student Management.
studentResultsBody.addEventListener("click", function (event) {
  const button = event.target.closest(".view-activity-btn");

  if (button && studentResultsBody.contains(button)) {
    showStudentDetails(button.closest("tr"));
  }
});

// View Student from the Queue table.
document
  .getElementById("queueTableBody")
  .addEventListener("click", function (event) {
    const button = event.target.closest(".view-btn");

    if (button && event.currentTarget.contains(button)) {
      showStudentDetails(button.closest("tr"));
    }
  });
