console.log("NEW APPOINTMENT JS FILE LOADED"); // =====================================================
// APPOINTMENT PAGE ACCESS CONTROL
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  if (
    !loggedInUser ||
    (!loggedInUser.studentNumber && !loggedInUser.staffNumber)
  ) {
    alert("Guests cannot access the appointment booking page.");
    window.location.href = "StudentDashboard.html";
    return;
  }

  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");

  if (userName) {
    const firstName = loggedInUser.firstName || loggedInUser.name || "";
    const lastName = loggedInUser.lastName || loggedInUser.surname || "";

    userName.textContent = `${firstName} ${lastName}`.trim();
  }

  if (userRole) {
    if (loggedInUser.staffNumber) {
      userRole.textContent = "Staff";
    } else if (loggedInUser.studentNumber) {
      userRole.textContent = "Student";
    }
  }
});

// =====================================================
// APPOINTMENT BOOKING
// =====================================================
let availabilityRequestNumber = 0;

const timeSlotsContainer = document.getElementById("timeSlots");

const selectedTimeText = document.getElementById("selectedTime");

const selectedDateText = document.getElementById("selectedDate");

const appointmentDate = document.getElementById("appointmentDate");

const confirmButton = document.getElementById("confirmButton");

let selectedTime = null;

// =====================================================
// SET MINIMUM DATE TO TODAY
// =====================================================

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

appointmentDate.min = getLocalDateString();

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

flatpickr(appointmentDate, {
  minDate: getLocalDateString(),
  dateFormat: "Y-m-d",

  disable: [
    function (date) {
      // Disable Sundays and Saturdays.
      return date.getDay() === 0 || date.getDay() === 6;
    },
  ],

  onChange: function (selectedDates, dateString) {
    selectedDateText.textContent = dateString || "Not selected";

    // Reset the previously selected time.
    selectedTime = null;
    selectedTimeText.textContent = "Not selected";
    confirmButton.disabled = true;

    // Clear slots from the previously selected date.
    timeSlotsContainer.innerHTML = "";

    // Load availability for the newly selected date.
    if (dateString) {
      loadTimeSlots(dateString);
    }
  },
});

// =====================================================
// LOAD AVAILABLE TIME SLOTS
// =====================================================

async function loadTimeSlots(date) {
  const requestNumber = ++availabilityRequestNumber;

  timeSlotsContainer.innerHTML = "";

  selectedTime = null;

  selectedTimeText.textContent = "Not selected";

  confirmButton.disabled = true;

  if (!date) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/appointments/availability?date=${date}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load appointment availability.");
    }

    // Ignore an older request if the user has
    // already selected another date.
    if (requestNumber !== availabilityRequestNumber) {
      return;
    }

    // console.log("Appointment availability:", data);
    console.log("Loading availability for:", date, "Request:", requestNumber);

    const slots = data.slots;

    // Check which day was selected
    const selectedDate = new Date(`${date}T00:00:00`);
    const isFriday = selectedDate.getDay() === 5;

    // Create each time slot
    slots.forEach(function (slot) {
      const column = document.createElement("div");

      column.className = "col-6 col-md-3";

      const button = document.createElement("button");

      button.type = "button";

      button.textContent = slot.time;

      button.className = "time-slot";

      // =================================================
      // AVAILABLE SLOT
      // =================================================

      const [slotHour, slotMinute] = slot.time.split(":").map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;
      const clinicOpeningTime = 8 * 60 + 30;

      const isBeforeOpening = slotMinutes < clinicOpeningTime;

      const isAfterFridayClosing =
        isFriday && (slotHour > 13 || (slotHour === 13 && slotMinute >= 0));
      const isAfterWeekdayConsultationHours =
        !isFriday && (slotHour > 16 || (slotHour === 16 && slotMinute > 0));

      if (
        slot.available &&
        !isBeforeOpening &&
        !isAfterFridayClosing &&
        !isAfterWeekdayConsultationHours
      ) {
        button.classList.add("available-slot");

        button.dataset.time = slot.time;

        button.addEventListener("click", function () {
          // Remove previous selection
          document
            .querySelectorAll(".available-slot")
            .forEach(function (otherSlot) {
              otherSlot.classList.remove("selected-slot");
            });

          // Select this slot
          button.classList.add("selected-slot");

          // Store selected time
          selectedTime = slot.time;

          // Display selected time
          selectedTimeText.textContent = selectedTime;

          checkBooking();
        });
      } else if (
        isBeforeOpening ||
        isAfterFridayClosing ||
        isAfterWeekdayConsultationHours
      ) {
        button.classList.add("lunch-slot");
        button.disabled = true;
      }

      // =================================================
      // UNAVAILABLE SLOT
      // =================================================
      else {
        button.classList.add("unavailable-slot");

        button.disabled = true;
      }

      column.appendChild(button);

      timeSlotsContainer.appendChild(column);
    });
  } catch (error) {
    console.error("Error loading appointment availability:", error);

    timeSlotsContainer.innerHTML = `
            <div class="col-12">
                <p class="text-danger">
                    Unable to load appointment availability.
                </p>
            </div>
        `;
  }
}

// =====================================================
// WHEN DATE CHANGES
// =====================================================

/*appointmentDate.addEventListener(
    "change",
    function() {

        selectedDateText.textContent =
            appointmentDate.value;

        loadTimeSlots(
            appointmentDate.value
        );

    }
)*/

// =====================================================
// CHECK IF BOOKING CAN BE CONFIRMED
// =====================================================

function checkBooking() {
  if (appointmentDate.value !== "" && selectedTime !== null) {
    confirmButton.disabled = false;
  } else {
    confirmButton.disabled = true;
  }
}

// =====================================================
// CONFIRM APPOINTMENT
// =====================================================

confirmButton.addEventListener("click", async function () {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        date: appointmentDate.value,

        time: selectedTime,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to book appointment.");
    }

    alert(
      "Appointment booked successfully for " +
        appointmentDate.value +
        " at " +
        selectedTime,
    );

    console.log("Booked appointment:", data);

    // Reload the availability for the same date.
    // The newly booked slot should now appear unavailable.
    await loadTimeSlots(appointmentDate.value);
  } catch (error) {
    console.error("Error booking appointment:", error);

    alert(error.message);
  }
});
