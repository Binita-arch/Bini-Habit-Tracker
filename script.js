document.addEventListener('DOMContentLoaded', function () {
    loadHabits();

    document.getElementById('habitForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addHabit();
    });

    document.getElementById('qrButton').addEventListener('click', generateQRCode);

    document.getElementById('authButton').addEventListener('click', function () {
        alert('Biometric authentication coming soon!');
    });
});

// Load habits from localStorage
function loadHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = ''; // Clear list before loading

    const habits = JSON.parse(localStorage.getItem('habits')) || [];

    if (habits.length === 0) {
        return; // Don't display anything if no habits exist
    }

    habits.forEach((habit, index) => {
        const li = document.createElement('li');

        const habitSpan = document.createElement('span');
        habitSpan.textContent = habit.name;
        habitSpan.classList.add("habit-text");

        const streakSpan = document.createElement('span');
        streakSpan.textContent = `🔥 Streak: ${habit.streak} days`;
        streakSpan.classList.add("streak");

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add("edit-button");
        editButton.onclick = function () {
            editHabit(index, habitSpan, saveButton);
        };

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.classList.add("save-button", "hidden");
        saveButton.onclick = function () {
            saveHabit(index, habitSpan, saveButton, editButton);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = function () {
            deleteHabit(index);
        };

        const checkInButton = document.createElement('button');
        checkInButton.textContent = '✅ Check-in';
        checkInButton.classList.add("check-in-button");
        checkInButton.onclick = function () {
            checkIn(index);
        };

        li.appendChild(habitSpan);
        li.appendChild(editButton);
        li.appendChild(saveButton);
        li.appendChild(deleteButton);
        li.appendChild(checkInButton);
        li.appendChild(streakSpan);

        habitList.appendChild(li);
    });
}

// Add new habit
function addHabit() {
    const habitInput = document.getElementById('habitInput');
    const habitName = habitInput.value.trim();

    if (habitName === '') {
        alert('Please enter a habit.');
        return;
    }

    const habits = JSON.parse(localStorage.getItem('habits')) || [];

    const newHabit = {
        name: habitName,
        streak: 0,
        lastCheckIn: null,
    };

    habits.push(newHabit);
    localStorage.setItem('habits', JSON.stringify(habits));

    habitInput.value = '';
    loadHabits();
}

// Edit habit
function editHabit(index, habitSpan, saveButton) {
    habitSpan.setAttribute('contenteditable', 'true');
    habitSpan.focus();
    saveButton.classList.remove("hidden");
}

// Save habit
function saveHabit(index, habitSpan, saveButton, editButton) {
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    habits[index].name = habitSpan.textContent.trim();
    localStorage.setItem('habits', JSON.stringify(habits));

    habitSpan.removeAttribute('contenteditable');
    saveButton.classList.add("hidden");
    editButton.classList.remove("hidden");
    loadHabits();
}

// Delete habit
function deleteHabit(index) {
    if (confirm('Do you want to delete this habit?')) {
        const habits = JSON.parse(localStorage.getItem('habits')) || [];
        habits.splice(index, 1);
        localStorage.setItem('habits', JSON.stringify(habits));
        loadHabits();
    }
}

// Check-in for streak tracking
function checkIn(index) {
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    const today = new Date().toDateString();

    if (habits[index].lastCheckIn === today) {
        alert('You already checked in today!');
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (habits[index].lastCheckIn === yesterday.toDateString()) {
        habits[index].streak += 1;
    } else {
        habits[index].streak = 1;
    }

    habits[index].lastCheckIn = today;
    localStorage.setItem('habits', JSON.stringify(habits));
    loadHabits();
}

// Generate QR code
function generateQRCode() {
    document.getElementById('qrCode').innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}" alt="QR Code">
    `;
}
