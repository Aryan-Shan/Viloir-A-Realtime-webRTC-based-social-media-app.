// Author- Aryan Shandilya
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, remove, onChildAdded, onChildRemoved, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase config
//replace with your config details
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-DOMAIN-NAME",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGEBUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Store the timestamp of the last message sent by each user
const userMessageTimestamps = {};

// Set the spam prevention limits
const SPAM_LIMIT = 5; // Maximum number of messages
const TIME_WINDOW = 10000; // Time window in milliseconds (e.g., 10 seconds)

// UI Elements
const nameEntry = document.getElementById('nameEntry');
const enterBtn = document.getElementById('enterBtn');
const messages = document.getElementById('messages');
const sendMsgButton = document.getElementById('sendMsg'); 
const msgTxt = document.getElementById('msgTxt');
const msgBtn = document.getElementById('msgBtn');

// Sender information
let sender;

// Detect if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    sender = user.email;
    sessionStorage.setItem('sender', sender);
    showChatUI();
  } else {
    nameEntry.style.display = 'flex';
    messages.style.display = 'none';
    sendMsgButton.style.display = 'none';
  }
});

// Sign-in with Google
enterBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const email = user.email;

      // Validate email against the college email pattern
      const collegeEmailPattern = /^[a-z]+\.[0-9]{2}[A-Za-z]{3}[0-9]{5}@vitbhopal\.ac\.in$/;

      if (collegeEmailPattern.test(email)) {
        sender = email; 
        sessionStorage.setItem('sender', sender);
        showChatUI();
      } else {
        alert('You must sign in with your college email (@vitbhopal.ac.in).');
        auth.signOut();
      }
    })
    .catch((error) => {
      console.error("Error during sign-in:", error.message);
    });
});

// Show chat UI
function showChatUI() {
  nameEntry.style.display = 'none';
  messages.style.display = 'block';
  sendMsgButton.style.display = 'block';
}

// Function to check for spam
function isSpamming(sender) {
  const now = new Date().getTime();

  if (!userMessageTimestamps[sender]) {
    userMessageTimestamps[sender] = [];
  }

  // Add the current timestamp to the user's message history
  userMessageTimestamps[sender].push(now);

  // Remove timestamps outside the time window
  userMessageTimestamps[sender] = userMessageTimestamps[sender].filter(
    (timestamp) => now - timestamp <= TIME_WINDOW
  );

  // Check if the user exceeded the spam limit
  return userMessageTimestamps[sender].length > SPAM_LIMIT;
}

// Updated sendMsg function with spam check
function sendMsg() {
  const msg = msgTxt.value.trim();

  if (msg) {
    if (isSpamming(sender)) {
      alert("You are sending messages too quickly. Please slow down.");
      return; // Prevent the message from being sent
    }

    const timestamp = new Date().getTime();
    set(ref(db, "messages/" + timestamp), {
      msg: msg,
      sender: sender,
      timestamp: timestamp, // Store timestamp with the message
    });

    msgTxt.value = ""; 
  }
}

// Attach Enter key event listener
msgTxt.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    sendMsg(); 
  }
});

// Attach button click event listener
if (msgBtn) {
  msgBtn.addEventListener('click', () => {
    sendMsg();
  });
}

// Listen for new messages
onChildAdded(ref(db, "messages"), (data) => {
  const msgContainer = document.createElement('div');
  msgContainer.classList.add('outer');
  msgContainer.id = data.key;

  const innerDiv = document.createElement('div');
  innerDiv.id = 'inner';

  if (data.val().sender === sender) {
    innerDiv.classList.add('me');
    innerDiv.innerHTML = `<span class="sender_me">You:</span> ${data.val().msg}`;

    // Create a delete button and attach the event listener
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "DELETE";
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => dltMsg(data.key);
    innerDiv.appendChild(deleteBtn);
  } else {
    innerDiv.classList.add('notMe');
    innerDiv.innerHTML = `<span class="sender_notMe">${data.val().sender}</span>: ${data.val().msg}`;
    innerDiv.style.backgroundColor = getRandomLightColor();
  }

  msgContainer.appendChild(innerDiv);
  messages.appendChild(msgContainer);
  messages.scrollTop = messages.scrollHeight;
});

// Delete message function
function dltMsg(key) {
  remove(ref(db, "messages/" + key));
}

// When message is deleted
onChildRemoved(ref(db, "messages"), (data) => {
  const msgBox = document.getElementById(data.key);
  messages.removeChild(msgBox);
});

// Clean up old messages (older than 6 minutes)
function cleanupMessages() {
  const now = new Date().getTime();
  const sixMinutesAgo = now - (1 * 60 * 1000); // 6 minutes in milliseconds

  // Get all messages from the database
  get(ref(db, "messages")).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        const timestamp = message.timestamp;

        // If the message is older than 6 minutes, delete it
        if (timestamp < sixMinutesAgo) {
          remove(ref(db, "messages/" + childSnapshot.key));
        }
      });
    }
  }).catch((error) => {
    console.error("Error cleaning up messages:", error);
  });
}

// Run cleanup every 6 minutes (360000 ms)
setInterval(cleanupMessages, 0 * 0 * 1000);



// Listen for page unload events to log the user out and delete their messages
window.addEventListener('beforeunload', (event) => {
  if (sender) {
    deleteUserMessages(sender); // Delete user messages
    logoutUser(); // Log the user out
  }
});

// Function to delete all messages of a specific sender
function deleteUserMessages(userEmail) {
  get(ref(db, "messages"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();

          // If the message sender matches the user, delete it
          if (message.sender === userEmail) {
            remove(ref(db, "messages/" + childSnapshot.key));
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error deleting user messages on window unload:", error);
    });
}

// Function to log out the user
function logoutUser() {
  auth.signOut().catch((error) => {
    console.error("Error logging out user on page unload:", error);
  });
}


// Function to generate random light colors
function getRandomLightColor() {
  const r = Math.floor(Math.random() * 156) + 100; // Red value between 100-255
  const g = Math.floor(Math.random() * 156) + 100; // Green value between 100-255
  const b = Math.floor(Math.random() * 156) + 100; // Blue value between 100-255
  return `rgb(${r}, ${g}, ${b})`;
}