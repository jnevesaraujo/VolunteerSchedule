// Generate dummy data on window load
function generateDummyData() {
    // Check if data already exists
    const existingData = localStorage.getItem('volunteerBookings');
    if (existingData && JSON.parse(existingData).length > 0) {
        console.log('Dummy data already exists, skipping generation');
        return;
    }

    const dummyNames = [
        'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 
        'Emma Brown', 'Frank Miller', 'Grace Taylor', 'Henry Garcia',
        'Ivy Martinez', 'Jack Anderson', 'Kate Thompson', 'Leo White',
        'Maya Rodriguez', 'Noah Clark', 'Olivia Lewis', 'Paul Walker'
    ];

    const dummyBookings = [];
    
    // Get current date for generating realistic dates
    const today = new Date();
    
    // Generate bookings for past dates (last 8 weeks)
    for (let weeksAgo = 8; weeksAgo >= 1; weeksAgo--) {
        const saturday = new Date(today);
        saturday.setDate(today.getDate() - (today.getDay() + 1) + (7 * (1 - weeksAgo))); // Get past Saturdays
        
        const dateString = saturday.getFullYear() + '-' + 
                          String(saturday.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(saturday.getDate()).padStart(2, '0');
        
        // Randomly decide if this date should have bookings (80% chance)
        if (Math.random() > 0.2) {
            const numBookings = Math.random() > 0.3 ? 2 : 1; // 70% chance of full booking
            const shuffledNames = [...dummyNames].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numBookings; i++) {
                const position = i === 0 ? 'chair' : 'co-host';
                const booking = {
                    id: `dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: shuffledNames[i],
                    date: dateString,
                    position: position,
                    timestamp: new Date(saturday.getTime() - (7 * 24 * 60 * 60 * 1000) + Math.random() * (6 * 24 * 60 * 60 * 1000))
                };
                dummyBookings.push(booking);
            }
        }
    }
    
    // Generate some future bookings (next 4-6 weeks)
    const futureWeeks = [2, 3, 5, 7]; // Skip some weeks to show availability
    futureWeeks.forEach(weeksFromNow => {
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - today.getDay()) + (7 * (weeksFromNow - 1)));
        
        const dateString = saturday.getFullYear() + '-' + 
                          String(saturday.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(saturday.getDate()).padStart(2, '0');
        
        // Randomly assign 1-2 bookings for future dates
        const numBookings = Math.random() > 0.5 ? 2 : 1;
        const shuffledNames = [...dummyNames].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numBookings; i++) {
            const position = i === 0 ? 'chair' : 'co-host';
            const booking = {
                id: `dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: shuffledNames[i + 8], // Use different names for future bookings
                date: dateString,
                position: position,
                timestamp: new Date(today.getTime() - Math.random() * (2 * 24 * 60 * 60 * 1000)) // Registered in last 2 days
            };
            dummyBookings.push(booking);
        }
    });
    
    // Save to localStorage
    localStorage.setItem('volunteerBookings', JSON.stringify(dummyBookings));
    console.log(`Generated ${dummyBookings.length} dummy bookings`);
}

// Call on window load
window.addEventListener('load', function() {
    generateDummyData();
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        loadBookingsFromLocalStorage();
    }, 100);
});