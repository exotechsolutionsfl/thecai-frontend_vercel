Here’s the revised version of your **README.md** without the legacy PDFs section:

---

# ThecAI App  

ThecAI is a **comprehensive car maintenance web app** that provides detailed, personalized information to assist users with vehicle upkeep. Designed for efficiency and precision, ThecAI offers **modern car manuals**, intuitive navigation, and **real-time feedback**, ensuring users can easily find what they need for any vehicle task.

This project is built with **Next.js** for the frontend and **FastAPI** for the backend, leveraging tools like **Tailwind CSS**, **Lucide React**, and **Framer Motion** for smooth UI and animations.

---

## Features  
- **Vehicle Management:** Easily add, update, or remove vehicles in your profile.  
- **Modern Manuals:** Get enhanced manuals with well-organized topics, subtopics, and detailed diagrams for easy understanding.  
- **User Feedback System:** Collect real-time feedback via the side menu for continuous improvement.  
- **Responsive Design:** Optimized for mobile and desktop screens with a dark theme using #121212 as the base and orange (#FFA500) accents.  
- **Smooth Animations:** Powered by Framer Motion for a delightful user experience.  
- **Real-time Search:** Quickly find relevant topics, diagrams, or subtopics based on your selected vehicle data.

---

## Getting Started  

Follow these steps to run ThecAI locally on your machine.  

### Prerequisites  
- **Node.js** (>= 14.x)  
- **Python** (>= 3.8 for backend API)  
- **npm** or **yarn** package manager  

### Installation  

Clone the repository:  
```bash
git clone https://github.com/your-repo/thecai.git  
cd thecai
```  

Install dependencies:  
```bash
npm install  
# or  
yarn install  
```  

### Running the Development Server  

Start the frontend:  
```bash
npm run dev  
# or  
yarn dev  
```  

Start the backend (FastAPI):  
```bash
uvicorn main:app --reload  
```  

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

---

## Deployment  

ThecAI is deployed using the **Vercel Platform** for seamless performance. You can follow these steps to deploy it:  

1. Install the Vercel CLI:  
   ```bash
   npm install -g vercel  
   ```

2. Link your project:  
   ```bash
   vercel link  
   ```

3. Deploy your app:  
   ```bash
   vercel deploy --prod  
   ```

Learn more about deployment in the [Vercel Documentation](https://vercel.com/docs).

---

## Tech Stack  

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion  
- **Backend:** FastAPI  
- **Database:** MongoDB Atlas  
- **Icons:** Lucide React  

---

## Contributing  

Contributions are welcome! If you have ideas or improvements, feel free to open an issue or submit a pull request. Please follow the [contributing guidelines](CONTRIBUTING.md).

---

## License  

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE.md) file for details.

---

## Feedback  

We’d love to hear your thoughts! Use the **feedback menu inside the app** or open an issue on GitHub for suggestions and bug reports.  

---

This version removes references to legacy PDFs and keeps the focus on modern manuals. Let me know if this works or if you'd like any further changes!