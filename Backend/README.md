# CitizEye Backend

The backend service for **CitizEye**, a platform designed to help citizens report civic issues (like potholes, garbage, broken streetlights) with AI-powered image classification.

## Tech Stack

*   **Node.js & Express**: Core framework for building the REST API.
*   **MongoDB (Mongoose)**: NoSQL database for storing user reports.
*   **Redis**: Used for caching AI models/classification results to optimize performance.
*   **Firebase Admin**: Authentication middleware to secure endpoints via Firebase Auth tokens.
*   **Hugging Face Inference API**: AI model integration for automatically classifying uploaded images.
*   **Multer**: Middleware for handling `multipart/form-data` and saving image uploads locally.
*   **Nodemailer**: Automated email notifications upon successful submission of a report.

## Features

*   **Secure API Endpoints**: Protected routes using Firebase Authentication.
*   **AI Image Classification**: Automatically determines the category of the civic issue from an uploaded image or URL using Hugging Face models.
*   **Email Notifications**: Dispatches an email notification to relevant authorities/administrators with report details and the image.
*   **Flexible Uploads**: Supports both direct image file uploads and image URLs.

## Prerequisites

Before running the application, make sure you have the following installed:

*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
*   [Redis](https://redis.io/) (Running locally or via WSL)
*   A Firebase Project with Authentication enabled
*   A Hugging Face Account and API Token

## Environment Variables

Create a `.env` file in the root directory (`Backend/`) and add the following variables:

```env
PORT=5000
MONGO_LINK=your_mongodb_connection_string
HF_TOKEN=your_huggingface_api_token
# Add your email configuration (for Nodemailer) if configured via env
```

*Note: You also need the `serviceAccountkey.json` file in the root of your backend directory for Firebase Admin initialization.*

## Installation & Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start Redis:**
    Ensure your Redis server is running (e.g., via WSL or Docker).

3.  **Run the Server:**

    ```bash
    npm start
    ```

    The server will start on the port specified in your `.env` (default is 5000).

## API Endpoints

### Base URL: `/api/reports`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a new report. Accepts `multipart/form-data` (image file) or JSON with `imageUrl`. Automatically classifies the image using AI and triggers an email notification. | Yes |
| `GET` | `/` | Retrieve a list of all submitted reports, sorted by the most recent first. | No |
| `GET` | `/:id` | Retrieve the details of a specific report by its ID. | No |

### Request Body (POST `/api/reports`)

**When using `multipart/form-data` (File Upload):**
*   `image`: The image file (handled by Multer).
*   `description`: Text description of the issue.
*   `location`: Stringified JSON containing location data (e.g., address, coordinates).

**When using JSON (Image URL):**
*   `imageUrl`: URL to the image.
*   `description`: Text description of the issue.
*   `location`: JSON object containing location data.

## Project Structure

*   `app.js`: Application entry point and server setup.
*   `controllers/`: Contains the core logic for the API endpoints.
*   `middlewares/`: Custom middleware, including Multer for uploads and Firebase Auth bouncer.
*   `models/`: Mongoose schemas (e.g., `reports.js`).
*   `routes/`: Express route definitions.
*   `services/`: External service integrations (Redis, Hugging Face AI, Nodemailer).
*   `uploads/`: Local directory where user-uploaded images are temporarily/permanently stored.

## Future Scope

*   **Frontend**: A dedicated client-side application is planned, which will be built using **React** for the UI components and state management, and **Bootstrap** for responsive, mobile-first styling. 
*   **Deployment**: The backend (and eventually the frontend) will be deployed to a production environment (e.g., Vercel, Render, or AWS) to make the platform accessible to the public.
