# Virtual Event Volunteer Application

This project is a single-page application (SPA) designed to manage volunteer sign-ups for a weekly virtual event. It provides a simple and intuitive interface for users to select volunteer positions for upcoming events and track their participation.

---

## Features

* **Dynamic Volunteer Sign-Ups:** Users can sign up for specific roles, such as "**Chairperson**" or "**Co-host**," for a series of upcoming Saturday events.
* **Smart Validation:** The application uses **JavaScript** to validate sign-ups in real time. If a position for a specific date is already taken, it becomes unavailable to subsequent users, ensuring no double-booking.
* **Volunteer Tracking:** A simple table displays a running total of how many events each volunteer has signed up for. This data is updated dynamically as users register.
* **Bulk File Downloads:** Users can select multiple event-related files and download them simultaneously. A built-in 2-second delay between downloads prevents browser security flags.
* **Data Persistence:** For this GitHub demo, all user data is stored in **local storage**. This allows you to experience the full functionality of the application without a live database connection.

---

## Technology Stack

* **Frontend:**
    * **HTML5:** Structures the content of the single-page application.
    * **CSS3:** Styles the application for a clean, user-friendly interface.
    * **JavaScript (JS):** Powers the dynamic features, including form validation, data updates, and download functionality.
* **Backend (Original Version):**
    * **Google Firestore:** A NoSQL cloud database used for real-time data storage and synchronization.
    * **Google Cloud:** The platform where the original application is hosted and deployed.

---

## Demo

This project is fully functional as a demo using **local storage**. To run it, simply clone the repository and open the `index.html` file in your web browser.

**Note:** The original version of this application connects to a **Google Firestore** database for persistent data storage. This GitHub repository is configured to demonstrate the frontend functionality using local storage for a simple and effective demo.