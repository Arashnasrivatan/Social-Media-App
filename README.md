
# Social Media App 🌐💬

A feature-rich social media platform built using **HTML**, **CSS**, **JavaScript**, **MongoDB**, and **Node.js**. This app allows users to connect, share, and interact with others in a secure and engaging environment. 🚀✨

## 📜 Features

- **User Registration and Login** 🔐👤: Sign up and log in securely with hashed passwords and session management.
- **Forgot Password ✅**: Users can recovery and update their passwords 
- **Profile Management** 📝🖼️: Users can customize their profiles with profile pictures, bio, and personal information.
- **Post Creation** 📝📸: Share text posts, images, and videos with your followers.
- **Commenting and Liking** 💬❤️: Interact with posts through comments and likes.
- **Follow and Unfollow** ➕➖: Stay updated with your favorite users by following them.


## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arashnasrvatan/social-media-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd social-media-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set up your `.env` file with the following environment variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/social
   PORT=4002
   NODE_ENV=development
   SESSION_SECRET=your-secret-key
   JWT_SECRET=your-jwt-secret
   ```

## 🚀 Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to `http://localhost:4002` to see the app in action.

## 📂 Folder Structure

- **/public**: Contains static files such as CSS, images, and client-side JavaScript.
- **/src**
- **/views**: Includes the HTML templates.
- **/utils**: for utils.
- **/models**: Mongoose models for interacting with MongoDB.
- **/modules**: controllers routers and validations.

## 🛠️ Built With

- **HTML/CSS/JS** for front-end
- **Node.js** for the server
- **Express.js** for routing
- **MongoDB** for the database
- **Mongoose** for MongoDB object modeling

## 📞 Contact

For any questions or feedback, reach out at [arash_aio](https://t.me/arash_aio).