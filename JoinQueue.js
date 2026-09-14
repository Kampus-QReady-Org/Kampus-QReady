const joinQueueButton = document.getElementById("joinQueueButton");

const leaveQueueButton = document.getElementById("leaveQueueButton");

const ticketCard = document.getElementById("ticketCard");

const ticketNumber = document.getElementById("ticketNumber");

const myPosition = document.getElementById("myPosition");

const peopleAhead = document.getElementById("peopleAhead");

const myWaitTime = document.getElementById("myWaitTime");


// =========================
// JOIN QUEUE
// =========================

joinQueueButton.addEventListener("click", function () {

    // Temporary ticket number
    // This will eventually come from the backend/database.

    ticketNumber.textContent = "Q024";

    myPosition.textContent = "7";

    peopleAhead.textContent = "6";

    myWaitTime.textContent = "35 min";


    // Show ticket

    ticketCard.style.display = "block";


    // Change button

    joinQueueButton.innerHTML =
        '<i class="bi bi-check-circle"></i> Joined Queue';

    joinQueueButton.disabled = true;


    // Scroll to ticket

    ticketCard.scrollIntoView({
        behavior: "smooth"
    });

});



// =========================
// LEAVE QUEUE
// =========================

leaveQueueButton.addEventListener("click", function () {

    const confirmLeave = confirm(
        "Are you sure you want to leave the queue?"
    );


    if (confirmLeave) {

        ticketCard.style.display = "none";


        joinQueueButton.innerHTML =
            '<i class="bi bi-plus-circle"></i> Join Queue';


        joinQueueButton.disabled = false;

    }

});