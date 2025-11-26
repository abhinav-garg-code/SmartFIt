# SmartFIt

Smart Fit AI is an advanced, AI-powered fitness companion designed to help you achieve your dream physique with precision and personalization. It analyzes your goals, body type, lifestyle, and progress to create dynamic workout plans, tailored nutrition guidance, and real-time adjustments.


![image alt](https://github.com/abhinav-garg-code/SmartFit/blob/2c52f51bb425e25a9c1ad9051c22cad18e34c345/assets/Screenshots/Screenshot%202025-11-26%20165205.png)

![image alt](https://github.com/abhinav-garg-code/SmartFit/blob/3a2b95cbd399e16d2949dd52192a55665ef5e727/assets/Screenshots/Screenshot%202025-11-26%20165226.png)

![image alt](https://github.com/abhinav-garg-code/SmartFit/blob/1fb041bb919832736127d3b195dd166d89e8e458/assets/Screenshots/Screenshot%202025-11-26%20165353.png)



---

## 📋 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Download the project**
   - Download ZIP file from the repository
   - Extract and open in VSCode

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   - Create a `.env.local` file in the root directory of your project
   - Add the following variables:
   ```env
   VITE_API_KEY=your_api_key_here
   VITE_API_URL=your_api_url_here
   ```
   - Replace `your_api_key_here` with your actual API key
   - Replace `your_api_url_here` with your API endpoint URL
   - **⚠️ Important:** Add `.env.local` to your `.gitignore` to prevent committing sensitive data

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_KEY` | Your API key for authentication | Yes | `sk_live_abc123xyz...` |
| `VITE_API_URL` | Base URL for API endpoints | Yes | `https://api.example.com` |

### How to Access Environment Variables in Code

```javascript
// Access in your React components or JavaScript files
const apiKey = import.meta.env.VITE_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;

// Example API call
const response = await fetch(`${apiUrl}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});
```

### ⚠️ Security Notes

- Never commit `.env.local` to version control
- Ensure `.env.local` is listed in your `.gitignore` file
- Variables prefixed with `VITE_` are exposed to the client-side code. Do not store sensitive secrets that must remain private
- Use a `.env.example` file to document required variables without sensitive values

---

## 🎨 Customization

### Areas to Update (Commented in Code)

**1. Logo**
- Location: `src/components/LandingPage.jsx` (line ~44)
- Replace emoji icon with your logo image
- Place logo in `public/` folder (e.g., `public/logo.png`)
- Update CSS in `src/components/LandingPage.css` (line ~66)

**2. Background Image**
- Location: `src/components/LandingPage.css` (line ~4)
- Options: gradient (current), background image, or solid color
- Place background image in `public/images/` folder
- Uncomment and update the background-image URL

**3. Example Images**
- Location: `src/components/LandingPage.jsx` (line ~117)
- Replace placeholder divs with actual `<img>` tags
- Place images in `public/images/` folder
- Update image paths to `/images/your-image.jpg`
- Recommended size: 400x400px to 800x800px

**4. Navigation Links**
- Location: `src/components/LandingPage.jsx` (line ~47)
- Update navigation items as needed
- Add dropdown functionality if required
- Add onClick handlers or navigation links

**5. CTA Buttons**
- Location: `src/components/LandingPage.jsx` (lines ~64, ~78)
- Add onClick handlers or links to navigate
- Update button text if needed

**6. Feature Descriptions**
- Location: `src/components/LandingPage.jsx` (line ~7)
- Customize feature descriptions in the `features` array
- Add or remove features as needed

### 🎯 Styling

All styles are in `src/components/LandingPage.css`. Key areas to customize:
- **Colors:** Update the dark theme colors throughout the CSS
- **Fonts:** Currently using Inter font from Google Fonts
- **Spacing:** Adjust padding and margins as needed
- **Animations:** Modify transition durations and effects

---

## 📁 Project Structure

```
SmartFit/
├── index.html
├── package.json
├── vite.config.js
├── .env.local                    # Environment variables (create this file)
├── .gitignore
├── public/
│   └── images/                   # Place your images here
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # App styles
│   ├── index.css                 # Global styles
│   └── components/
│       ├── LandingPage.jsx       # Landing page component
│       └── LandingPage.css       # Landing page styles
└── README.md
```

### 📸 Image Placement

- **Logo:** Place in `public/logo.png` or `public/images/logo.png`
- **Background Images:** Place in `public/images/background.jpg`
- **Example Images:** Place in `public/images/example1.jpg`, `example2.jpg`, etc.
- **Access in code:** Use paths like `/images/your-image.jpg` (starting with `/`)

---

## 💻 Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling
- **Google Fonts** - Inter font family
- Vertex AI
---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.
