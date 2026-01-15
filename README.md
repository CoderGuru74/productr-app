roductr App - Inventory Management System
A full-stack web application designed to manage products, including adding, editing, and publishing products to a live store dashboard.

🚀 Getting Started
Follow these steps to get the project running on your local machine.

1. Prerequisites
Node.js (v14 or higher)

npm (comes with Node.js)

MongoDB (Local or Atlas URI)

2. Backend Setup
The backend handles the API logic, image compression, and database storage.

Navigate to the server directory:

Bash

cd server
Install dependencies:

Bash

npm install
Run the Backend Server: Note: We use a high HTTP header size to accommodate large image data.

Bash

node --max-http-header-size=100000000 index.js
The server should now be running (usually on http://localhost:5000).

3. Frontend Setup
The frontend is built with React and Vite for a fast development experience.

Navigate to the client directory:

Bash

cd client
Install dependencies:

Bash

npm install
Run the Frontend App:

Bash

npm run dev
✨ Features
Status-Based Filtering: Products automatically move between the Published and Unpublished sections on the Home page.

Vertical Dialog Form: A user-friendly, responsive modal for adding and editing product details.

Responsive Design: Fully optimized for mobile, tablet, and desktop views.

Image Compression: Frontend compresses images to Base64 before sending them to the backend to optimize performance.

🌐 API Configuration
The application is configured to automatically switch between local development and production (Render):

Local: http://localhost:5000

Production: https://productr-app.onrender.com
If otp didnt arrives use 123456 as otp

📝 Usage Notes
Network Error? If running on Render, the server might take 60 seconds to "wake up" after inactivity.
🛠️ Commands to Run
- Backend: `node --max-http-header-size=100000000 index.js`
- Frontend: `npm run dev`

 🔑 Master Access
- Test OTP: `123456` (Works for all email addresses)
