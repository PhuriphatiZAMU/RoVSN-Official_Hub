# RoV SN Tournament Hub (React Next-Gen)

A modern Esports Tournament management system, fully migrated from a static HTML/CSS/JS frontend to a dynamic React (Vite) application, backed by a Node.js/Express/MongoDB API.

![React Badge](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TailwindCSS Badge](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js Badge](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js Badge](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB Badge](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite Badge](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Lucide React Badge](https://img.shields.io/badge/Lucide_React-000000?style=for-the-badge&logo=lucide&logoColor=white)

## ✨ Features

-   **📱 Modern & Responsive UI:** Built with React and styled using Tailwind CSS, providing a sleek, responsive design across all devices.
-   **⚡ Real-time Data Fetching:** Dynamic display of match schedules, tournament standings, and player statistics, all powered by a robust Node.js API connected to MongoDB.
-   **🛡️ Admin Dashboard:** A secure, PIN-protected interface (`/admin`) for administrators to easily update and manage match scores, ensuring real-time data accuracy.
-   **🤖 AI Predictions:** Integrated AI-powered match analysis and win probability predictions (`/predictions`) to provide users with deeper insights into upcoming games.
-   **Modular Architecture:** Clean, component-based React structure for maintainability and scalability.

## 🚀 Installation & Local Development

Follow these steps to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16.0.0 or higher)
-   [npm](https://www.npmjs.com/) (v8.0.0 or higher)
-   MongoDB instance (local or Atlas)

### Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/PhuriphatiZAMU/RoVSN-Official_Hub.git
    cd RoVSN-Official_Hub
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the project's root directory. This file should contain your MongoDB connection URI:
    ```
    MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
    ```
    Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your MongoDB credentials.

3.  **Install Dependencies & Build Client:**
    The root `package.json` (located in the `json` directory) contains scripts to manage both client and server dependencies.
    ```bash
    npm install --prefix json
    npm run build --prefix json
    ```
    -   `npm install --prefix json`: Installs server dependencies.
    -   `npm run build --prefix json`: Navigates into the `client` directory, installs client dependencies, and then builds the React application into `client/dist`.

    **Important:** After running `npm run build --prefix json`, ensure that the `Key-Visual-img` and `img` folders from the project's root are moved into the `client/public` directory. This is crucial for the React app to correctly display images in development and production builds.
    
    ```bash
    # From project root
    mv Key-Visual-img client/public/Key-Visual-img
    mv img client/public/img
    ```
    *(Note: The above commands are for Linux/macOS. For Windows, use `move` instead of `mv`.)*

4.  **Start the Application:**
    Once the client is built and assets are moved, start the integrated server and client:
    ```bash
    npm start --prefix json
    ```
    This command starts the Node.js backend, which will serve the React frontend for all non-API routes.

5.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:3001` (or the port specified in your server configuration).

## 📂 Project Structure

-   `client/`: The React frontend application (built with Vite).
    -   `public/`: Static assets (images, favicon, etc.).
    -   `src/`: React source code.
        -   `components/`: Reusable UI components (e.g., `Navbar.jsx`, `MatchCard.jsx`).
        -   `pages/`: Top-level page components (e.g., `Home.jsx`, `Schedule.jsx`, `AdminDashboard.jsx`, `Predictions.jsx`).
        -   `layout/`: Layout components (`MainLayout.jsx`).
        -   `data/`: Mock data for development (`mockData.js`).
        -   `services/`: API integration logic (`api.js`).
        -   `constants/`: Global constants (`constants.js` - *to be created*).
-   `js/`: Node.js backend server code (`server.js`).
-   `json/`: Contains the main `package.json` for the monorepo-like setup and `vercel.json` for Vercel deployment.
-   `README_DEPLOY.md`: Detailed deployment instructions for platforms like Render/Vercel.

## 🛠️ Admin Dashboard Access

The Admin Dashboard is accessible at `/admin`.
**Default Admin PIN:** `1234` (This should be changed in a production environment).

## 🚀 Deployment

Refer to `README_DEPLOY.md` for detailed instructions on deploying this application to platforms like Render or Vercel.

---

Feel free to explore, contribute, or adapt this project to your needs!