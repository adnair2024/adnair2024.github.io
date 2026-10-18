# Personal Portfolio Website

This is a clean, modern, single-page personal portfolio website designed for developers and creatives to showcase their work and skills. It features a dynamic 3D animated background powered by Three.js and automatically displays your latest GitHub repositories.

## Features

*   **Modern Design**: A sleek, dark-themed, and responsive single-page layout.
*   **Dynamic Background**: An interactive 3D Three.js Torus Knot animation with a custom GLSL shader for a unique visual experience. Includes mouse and touch-based parallax effects.
*   **Automated Project Display**: Fetches and showcases your most recently updated public GitHub repositories directly from the GitHub API.
*   **Easy Customization**: Simple configuration for personal details, GitHub integration, and styling.
*   **GitHub Pages Ready**: Optimized for deployment on GitHub Pages.

## Live Demo

https://adnair2024.github.io

## Technologies Used

*   HTML5
*   CSS3 (Responsive Design)
*   JavaScript (ES6+)
*   Three.js (for 3D background animation)
*   GitHub API (for fetching projects)

## Getting Started

Follow these instructions to set up and customize your portfolio website.

### 1. Clone the Repository

```bash
git clone https://github.com/adnair2024/adnair2024.github.io.git
cd adnair2024.github.io
```

### 2. Customization

#### a. GitHub Projects Integration (`config.js`)

To display your GitHub repositories, update `config.js`:

```javascript
// config.js
const GITHUB_USERNAME = "your-github-username"; // Replace with your GitHub username
const GITHUB_PROJECTS_COUNT = 6; // Number of projects to display
```

#### b. Personal Information (`index.html`)

Open `index.html` and update the following sections with your details:

*   **Navigation & Hero Section**: Your name, professional title, and bio.
*   **About Section**: Detailed information about yourself.
*   **Contact Section**: Your email, LinkedIn, GitHub profile link, etc.

#### c. Styling (`style.css`)

Customize the look and feel of your website by editing `style.css`. You can change:

*   Colors
*   Fonts
*   Layout adjustments
*   Responsive breakpoints

#### d. Three.js Background (`three_background.js`)

For advanced users, the `three_background.js` file contains the logic for the animated background. You can tweak parameters within the `PARAMS` object to modify the Torus Knot's shape, animation speed, and shader effects.

### 3. Local Development (Optional)

To preview your changes locally before deploying:

1.  **Install a Local Web Server**: If you don't have one, you can use `http-server` (Node.js) or Python's built-in server.

    *   **Using `http-server` (Node.js required)**:
        ```bash
        npm install -g http-server
        http-server .
        ```
    *   **Using Python**:
        ```bash
        # For Python 3
        python -m http.server
        # For Python 2
        python -m SimpleHTTPServer
        ```

2.  **Access in Browser**: Open your web browser and navigate to `http://localhost:8080` (or the port indicated by your server).

### 4. Deployment to GitHub Pages

This repository is structured for easy deployment to GitHub Pages.

1.  Ensure your repository name matches the format `YOUR-USERNAME.github.io`.
2.  Push your changes to the `main` or `master` branch.
3.  Your website should be live at `https://YOUR-USERNAME.github.io`.

## Project Structure

*   `index.html`: The main HTML file containing the website structure.
*   `style.css`: Global styles for the website, including responsive design.
*   `script.js`: Handles dynamic content like fetching GitHub projects.
*   `config.js`: Configuration for GitHub username and project count.
*   `three_background.js`: Manages the Three.js animated background.
*   `assets/`: Contains favicon and other static assets.
*   `blog/`: (If applicable) Directory for a potential blog.

## Contributing

Feel free to fork the repository and adapt it for your own use. If you have suggestions or improvements, please open an issue or submit a pull request.


## Contact

Ashwin Nair

[My portfolio](https://adnair2024.github.io)

[My blog](https://adnair2024.github.io/blog/)
