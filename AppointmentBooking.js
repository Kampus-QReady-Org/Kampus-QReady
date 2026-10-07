const timeSlots = document.querySelectorAll(".available-slot");

const selectedTimeText =
    document.getElementById("selectedTime");

const selectedDateText =
    document.getElementById("selectedDate");

const appointmentDate = document.getElementById("appointmentDate");

const today = new Date().toISOString().split("T")[0];

appointmentDate.min = today;

const confirmButton =
    document.getElementById("confirmButton");


let selectedTime = null;


// When a time slot is clicked
timeSlots.forEach(function(slot) {

    slot.addEventListener("click", function() {

        // Remove previous selection
        timeSlots.forEach(function(otherSlot) {
            otherSlot.classList.remove("selected-slot");
        });


        // Select clicked slot
        slot.classList.add("selected-slot");


        // Store selected time
        selectedTime = slot.dataset.time;


        // Display selected time
        selectedTimeText.textContent = selectedTime;


        checkBooking();

    });

});


// When date changes
appointmentDate.addEventListener("change", function() {

    selectedDateText.textContent =
        appointmentDate.value;

    checkBooking();

});


// Check whether booking can be confirmed
function checkBooking() {

    if (
        appointmentDate.value !== "" &&
        selectedTime !== null
    ) {

        confirmButton.disabled = false;

    } else {

        confirmButton.disabled = true;

    }

}

// Confirm booking
confirmButton.addEventListener("click", async function() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "http://localhost:3000/api/appointments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: appointmentDate.value,
                    time: selectedTime
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to book appointment."
            );
        }

        alert(
            "Appointment booked successfully for " +
            appointmentDate.value +
            " at " +
            selectedTime
        );

        console.log("Booked appointment:", data);

        confirmButton.disabled = true;

    } catch (error) {

        console.error("Error booking appointment:", error);

        alert(error.message);
    }

});