# Paws Home - Animal Adoption Platform

This is a full-stack animal adoption website designed to connect stray animals with potential loving owners. The project features a decoupled frontend and backend architecture.

Current Status: The backend is already deployed on the Render cloud server. The frontend runs locally and connects directly to the cloud data.

# Tech Stack

Frontend

* HTML5 & CSS3: Responsive design using Flexbox and Grid.

* JavaScript (ES6+): Native JS for interaction, no third-party framework dependencies.

* Deployment: Static files (Run locally directly).

Backend

* Java Spring Boot: Provides RESTful APIs.

* MongoDB Atlas: Cloud database.

* Deployment: Render (Free Tier).

# Quick Start

Since the backend is already deployed on the server, you do not need to install Java or configure a database locally. Simply run the frontend files.

1. Download Project

run "git clone https://github.com/TristaZhao1003/Animal-Adoption-Website.git"
Or download the ZIP and extract it

2. Run Frontend

   1. Navigate to the frontend directory within the project folder.

   2. Double-click to open the home.html file (or drag the file into your browser).

   3. Recommendation: Use the "Live Server" extension in VS Code for a better experience.

   4. The website will automatically connect to the remote backend API (https://animal-adoption-website.onrender.com)

# Admin Access

* The website includes an admin mode (e.g., for editing pet information). Please click Login in the top right corner and use the following credentials:
* Account (Email): admin@example.com 
* Password: admin123
* (Standard Test User: user@example.com / password123)

# Important: Server Latency

This project's backend uses a Render Free Instance. Please note:

1. Cold Start Delay: The server automatically spins down (sleeps) after 15 minutes of inactivity. When you open the page or try to login for the first time after a break, the backend may take 50 seconds to 1 minute to wake up.

2. Please Be Patient: If you see a loading spinner, do not close the page; the server is waking up and speed will return to normal shortly.

3. Auto-Retry: The frontend code has built-in timeout retry mechanisms. If the first request times out, the system will automatically attempt to reconnect.

# Project Structure

COMP3421_project/ <br>
｜── frontend/          <-- You only need to focus here <br>
│   ├── home.html      # Homepage (Entry point)<br>
│   ├── adoption.html  # Adoption listing page <br>
│   ├── css/           # Stylesheets <br>
│   └── js/            # Logic scripts <br>
└── maven/  # Backend source code (Deployed, no need to run locally) <br>