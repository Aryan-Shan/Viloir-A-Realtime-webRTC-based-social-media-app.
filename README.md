# Viloir 🎉

Viloir is a fun and interactive app designed for college students to connect randomly with each other. Inspired by Omegle, Viloir uses cutting-edge technologies like Firebase for authentication 🔒 and PeerJS to establish seamless connections 🌐 between users. It's the perfect platform for spontaneous conversations 💬 and meeting new friends online!  

## Features ✨

- **Random Matching**: Connect with another user at random for a chat 🎲.  
- **Secure Authentication**: Powered by Firebase for user safety 🔐.  
- **Real-Time Communication**: Peer-to-peer connections facilitated by PeerJS for smooth interactions ⚡.  
- **Simple and Intuitive UI**: A user-friendly interface for hassle-free chatting 🎨.  

## Installation 🚀  

Clone the repository and install the required dependencies:  

```bash
git clone https://github.com/yourusername/viloir.git
cd viloir
open index.html
```

## Usage
```bash
# Replace firebase config with your project configuration
# Replace configuration in the following files- firebase.js and global_chat.js

const firebaseConfig = {
    apiKey: "YOUR-API-KEY",
    authDomain: "YOUR-DOMAIN-NAME",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGEBUCKET",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

# For authentication replace the RegEx with desired RegEx in auth.js-
# const collegeEmailPattern = /^[a-z]+\.[0-9]{2}[A-Za-z]{3}[0-9]{5}@vitbhopal\.ac\.in$/;

# Make sure your have authorized the domain in your firebase console before testing the app locally 
```

## Technologies Used  
- **Frontend**: HTML, CSS, JavaScript 🖥️  
- **Backend**: Firebase 🔥  
- **Real-Time Communication**: PeerJS ⚡  
- **Deployment**: Deployed on Firebase ☁️  



