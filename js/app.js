// Global variables
let bookingsData = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    generateSaturdays();
    loadBookingsFromLocalStorage();
    
    document.getElementById('exportBtn').addEventListener('click', exportToJSON);
});

// Booking Loading Logic
function loadBookingsFromLocalStorage() {
    try {
        const savedBookings = JSON.parse(localStorage.getItem('volunteerBookings') || '[]');
        
        // Convert timestamp strings back to Date objects if needed
        bookingsData = savedBookings.map(booking => ({
            ...booking,
            timestamp: booking.timestamp ? new Date(booking.timestamp) : new Date()
        }));
        
        updateDashboard();
        updateDateOptions();
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsData = [];
        updateDashboard();
        updateDateOptions();
    }
}


// Generate next 12 Saturdays:
function generateSaturdays() {
    const dateSelect = document.getElementById('date');
    const today = new Date();
    
    // Find next Saturday using UTC to avoid timezone shifts
    const nextSaturday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7;
    if (daysUntilSaturday === 0 && today.getHours() > 23) {
        // If it's already Saturday afternoon, start from next Saturday
        nextSaturday.setDate(nextSaturday.getDate() + 7);
    } else {
        nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
    }
    
    for (let i = 0; i < 12; i++) {
        const saturday = new Date(nextSaturday);
        saturday.setDate(nextSaturday.getDate() + (i * 7));
        
        // Create date string in YYYY-MM-DD format (no timezone shift)
        const year = saturday.getFullYear();
        const month = String(saturday.getMonth() + 1).padStart(2, '0');
        const day = String(saturday.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const formattedDate = saturday.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const option = document.createElement('option');
        option.value = dateString;
        option.textContent = formattedDate;
        dateSelect.appendChild(option);
    }
}

// Update date options based on availability
function updateDateOptions() {
    const dateSelect = document.getElementById('date');
    const options = dateSelect.querySelectorAll('option[value]');
    
    options.forEach(option => {
        const dateBookings = bookingsData.filter(b => b.date === option.value);
        const isDateFull = dateBookings.length >= 2;
        
        if (isDateFull) {
            option.textContent += ' (FULL)';
            option.disabled = true;
            option.style.color = '#ff800aff';
        } else {
            const chairBooked = dateBookings.some(b => b.position === 'chair');
            const coHostBooked = dateBookings.some(b => b.position === 'co-host');
            
            if (chairBooked && !coHostBooked) {
                option.textContent += ' (Co-Host Available)';
            } else if (coHostBooked && !chairBooked) {
                option.textContent += ' (Chair Available)';
            }
        }
    });
}

// Handle form submission
document.getElementById('volunteerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const booking = {
        name: formData.get('name'),
        date: formData.get('date'),
        position: formData.get('position'),
        timestamp: new Date()
    };
    
    // Validate availability
    const dateBookings = bookingsData.filter(b => b.date === booking.date);
    
    if (dateBookings.length >= 2) {
        showMessage('This date is fully booked. Please choose another date.', 'error');
        return;
    }
    
    // Check position conflicts
    const chairBooked = dateBookings.some(b => b.position === 'chair');
    const coHostBooked = dateBookings.some(b => b.position === 'co-host');
    
    let finalPosition = booking.position;
    
    if (booking.position === 'chair' && chairBooked) {
        showMessage('Chair position is already taken for this date. Please choose Co-Host or another date.', 'error');
        return;
    } else if (booking.position === 'co-host' && coHostBooked) {
        showMessage('Co-Host position is already taken for this date. Please choose Chair or another date.', 'error');
        return;
    }
    
    booking.position = finalPosition;
    
    // Save to localStorage
    try {
        // Get existing bookings or initialize empty array
        const existingBookings = JSON.parse(localStorage.getItem('volunteerBookings') || '[]');
        
        // Add new booking with a unique ID
        booking.id = Date.now().toString();
        existingBookings.push(booking);
        
        // Save back to localStorage
        localStorage.setItem('volunteerBookings', JSON.stringify(existingBookings));
        
        showMessage('Thank you! Your volunteer registration has been confirmed.', 'success');
        e.target.reset();
        
        // Reload the bookings to update the display
        loadBookingsFromLocalStorage();
    } catch (error) {
        console.error('Error saving booking:', error);
        showMessage('Error saving your booking. Please try again.', 'error');
    }
});

// Update dashboard with current data
function updateDashboard() {
    const { futureBookings, pastBookings } = separateBookingsByDate();
    
    // Count future bookings
    const futureBookingsCount = Object.values(futureBookings)
        .reduce((total, bookingsArray) => total + bookingsArray.length, 0);
    
    document.getElementById('totalBookings').textContent = futureBookingsCount;

    // Only consider future dates for availability calculation
    const futureDatesWithBookings = Object.keys(futureBookings);
    const fullFutureDates = futureDatesWithBookings.filter(date => 
        futureBookings[date].length >= 2
    );
    
    // Get total future Saturdays available in the form
    const dateSelect = document.getElementById('date');
    const totalFutureSaturdays = dateSelect.options.length - 1; // -1 for the "Choose a date..." option
    
    const availableDates = totalFutureSaturdays - fullFutureDates.length;
    document.getElementById('availableDates').textContent = availableDates;
    
    // Update bookings list
    updateBookingsList(futureBookings, pastBookings);
    
    // Update top volunteers
    updateTopVolunteers();
}

// Cache current date calculation
const getCurrentDateString = () => {
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
};

// Reusable function for generating HTML
function createBookingItemHTML(date, bookings, isPast = false) {
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const item = document.createElement('div');
    item.className = isPast ? 'past-Booking' : 'booking-item';
    
    const isFull = bookings.length >= 2;
    const statusClass = isFull ? 'full' : 'available';
    const statusText = isFull ? 'Full' : `${bookings.length}/2 spots`;
    
    const volunteersHtml = bookings.map(b => 
        `<span class="volunteer-badge ${b.position === 'chair' ? 'chair-badge' : ''}">${b.name} (${b.position})</span>`
    ).join('');
    
    item.innerHTML = `
        <span class="booking-date">
            <span class="status-indicator ${statusClass}"></span>
            ${formattedDate} - ${statusText}
        </span>
        <div class="booking-volunteers">
            ${volunteersHtml}
        </div>
    `;
    
    return item;
}

// Single function to separate bookings by date
function separateBookingsByDate() {
    const currentDate = getCurrentDateString();
    const futureBookings = {};
    const pastBookings = {};
    
    // Single iteration to separate all bookings
    bookingsData.forEach(booking => {
        const target = booking.date >= currentDate ? futureBookings : pastBookings;
        if (!target[booking.date]) {
            target[booking.date] = [];
        }
        target[booking.date].push(booking);
    });
    
    return { futureBookings, pastBookings };
}

// Render bookings to a container
function renderBookings(dateBookings, container, isPast = false) {
    container.innerHTML = '';
    
    const sortedDates = Object.keys(dateBookings).sort();
    
    if (sortedDates.length === 0) {
        const message = isPast ? 'No past Events' : 'No upcoming bookings';
        container.innerHTML = `<div class="booking-item"><span class="booking-date">${message}</span></div>`;
        return;
    }
    
    sortedDates.forEach(date => {
        const bookings = dateBookings[date];
        const item = createBookingItemHTML(date, bookings, isPast);
        container.appendChild(item);
    });
}

// Main update function - now much cleaner
function updateBookingsList(futureBookings, pastBookings) {
    
    const upcomingContainer = document.getElementById('bookingsList');
    const pastContainer = document.getElementById('pastEvents');
    
    renderBookings(futureBookings, upcomingContainer, false);
    renderBookings(pastBookings, pastContainer, true);
}

function updateTopVolunteers() {
    const container = document.getElementById('topVolunteers');
    container.innerHTML = '';
    
    if (bookingsData.length === 0) {
        container.innerHTML = '<div class="volunteer-rank"><span>No volunteers yet</span></div>';
        return;
    }
    
    // Count volunteer frequencies
    const volunteerCounts = {};
    bookingsData.forEach(booking => {
        volunteerCounts[booking.name] = (volunteerCounts[booking.name] || 0) + 1;
    });
    
    // Sort by count
    const sortedVolunteers = Object.entries(volunteerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    sortedVolunteers.forEach(([name, count], index) => {
        const item = document.createElement('div');
        item.className = 'volunteer-rank';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="rank-number">${index + 1}</span>
                <span>${name}</span>
            </div>
            <span style="font-weight: bold; color: #4facfe;">${count} Event${count > 1 ? 's' : ''}</span>
        `;
        container.appendChild(item);
    });
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 5000);
}

// Update position options based on selected date
document.getElementById('date').addEventListener('change', function(e) {
    const selectedDate = e.target.value;
    const positionSelect = document.getElementById('position');
    
    if (!selectedDate) return;
    
    const dateBookings = bookingsData.filter(b => b.date === selectedDate);
    const chairBooked = dateBookings.some(b => b.position === 'chair');
    const coHostBooked = dateBookings.some(b => b.position === 'co-host');
    
    // Reset options
    const options = positionSelect.querySelectorAll('option');
    options.forEach(option => {
        option.disabled = false;
        option.textContent = option.textContent.replace(' (taken)', '');
    });
    
    // Disable taken positions
    if (chairBooked) {
        const chairOption = positionSelect.querySelector('option[value="chair"]');
        chairOption.disabled = true;
        chairOption.textContent += ' (taken)';
    }
    
    if (coHostBooked) {
        const coHostOption = positionSelect.querySelector('option[value="co-host"]');
        coHostOption.disabled = true;
        coHostOption.textContent += ' (taken)';
    }
});

// Making functions available globally
window.loadBookingsFromLocalStorage = loadBookingsFromLocalStorage;
window.generateSaturdays = generateSaturdays;
window.updateDashboard = updateDashboard;
window.updateDateOptions = updateDateOptions;
window.updateBookingsList = updateBookingsList;
window.updateTopVolunteers = updateTopVolunteers;
window.showMessage = showMessage;

// Export All Data from Local Storage
async function exportToJSON() {
    try {
        // Get data from localStorage instead of bookingsData
        const savedBookings = JSON.parse(localStorage.getItem('volunteerBookings') || '[]');
        
        const data = savedBookings.map(booking => ({
            ...booking,
            timestamp: booking.timestamp ? new Date(booking.timestamp).toISOString() : new Date().toISOString()
        }));
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `volunteer-bookings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export failed:', error);
        showMessage('Export failed. Please try again.', 'error');
    }
}