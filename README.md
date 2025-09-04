# 🎬 SkyStream

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TMDB API](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

SkyStream is a modern, responsive, and Netflix-inspired streaming website interface built with React.js. It provides a feature-rich user experience for browsing and viewing movies and TV shows, leveraging the TMDB API for all content metadata.

## ⚠️ Disclaimer

**SkyStream is a viewing platform only.** We do not store any movies, TV shows, or other media on our servers. All content is sourced from third-party services and streamed directly to the user. SkyStream acts as an interface to browse and access this content in a user-friendly way.

## ✨ Features

- **Netflix-Inspired UI**: A clean, dark-themed, and responsive design that feels familiar.
- **Content Discovery**: Browse trending, popular, and top-rated movies and TV shows.
- **Powerful Search**: Quickly find content across the entire library.
- **TMDB Integration**: All movie and TV show data, including posters, backdrops, and metadata, is fetched from The Movie Database (TMDB).
- **Multiple Video Players**: Integrates with various third-party video players to stream content.
- **Static Site Ready**: Optimized for fast and efficient deployment on static hosting platforms.

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: CSS3 with CSS Variables
- **API**: The Movie Database (TMDB) API
- **Deployment**: GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A TMDB API Key (you can get one for free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/skynergroup/skystream.git
    cd skystream
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your TMDB API key:
    ```
    VITE_TMDB_API_KEY=your_tmdb_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
