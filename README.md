# JWT Authentication System for Ninja Smoothies 🍹
A full-stack authentication system using Node.js, Express, MongoDB, and JWT (JSON Web Token). The app allows users to sign up, log in, and access protected routes with secure authentication. The system is built with security in mind, leveraging JWT for user sessions and cookie-based storage for tokens.

Features:
JWT Authentication: Secure login with tokens stored in HTTP-only cookies.
User Management: Sign up, log in, and log out functionality.
Password Visibility Toggle: Easily toggle password visibility on the login form.
Protected Routes: Access control for routes that require user authentication.
User Dashboard: Display logged-in user details (email, etc.).
EJS Templates: Dynamic server-side rendering with EJS templating.
Error Handling: Detailed error messages for invalid inputs, duplicate accounts, and login failures.
Middleware for Auth: Custom middleware to ensure routes are protected and user authentication is verified.


Technologies Used:
Node.js & Express for the backend.
MongoDB for database storage.
Mongoose for database schema modeling.
JWT (JSON Web Token) for secure user sessions.
EJS for rendering server-side views.
Cookie-Parser for handling cookies.


Setup Instructions:
Clone the repository:
git clone https://github.com/JaiLohana16/JWT-Authentication.git

Install dependencies:
npm install
Setup your MongoDB connection in .env or update dbURI in app.js.
Start the development server:
npm start
Access the application in your browser at http://localhost:3000.
