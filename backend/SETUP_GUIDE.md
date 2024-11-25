# 📃 SETUP GUIDE FOR BACKEND

## ❗ System Requirements

- [Git](https://git-scm.com/downloads): Version control system.

- [Node.js](https://nodejs.org/en/): JavaScript runtime built on Chrome's V8 JavaScript engine (Please go with any latest LTS versions)
- 

## 📝 Additional Requirements

- [Supabase](https://firebase.google.com/): The project uses supabase as a postgres database provider for the users. I recommend you to use the provided credentials below for Supabase configuration. Else i will also mention how to setup the complete database with postgres functions


## 🛠 Local Installation and Setup

1. If you are in the root folder get into the backend folder using
   ```bash
   cd backend
   ```
2. Install the required dependency for server using :

   ```javascript
   npm install
   ```

4. Create a `.env` file and copy-paste the contents of `.env.sample` in it.

5. Start the backend server using :

   ```javascript
   npm run dev
   ```