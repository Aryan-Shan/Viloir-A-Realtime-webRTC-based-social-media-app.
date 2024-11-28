// Author- Aryan Shandilya
import { database, ref, set, onDisconnect, onValue, remove, get, child } from './firebase.js';

// Configuration
const config = {
  host: '0.peerjs.com',
  port: 443,
  secure: true,
  key: 'peerjs',
  config: {
      iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
              urls: 'turn:your-turn-server.com:3478',
              username: 'your-username',
              credential: 'your-password',
          },
          {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
         },
         {
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        }
      ],
  },
};


let peer;
let localStream;
let call;
let connectionPeerId;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const nextButton = document.getElementById('nextBtn');
const logoutButton = document.getElementById('logoutBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Get the logged-in user from sessionStorage
const user = JSON.parse(sessionStorage.getItem('user'));

if (!user || !user.uid) {
    window.location.href = 'index.html';
}

// loading overlay functions
function showLoadingOverlay(message = 'Connecting...') {
  loadingOverlay.style.display = 'flex';
  loadingOverlay.querySelector('p').textContent = message;
}

function hideLoadingOverlay() {
  loadingOverlay.style.display = 'none';
}




// Initialize Peer with user UID
function initializePeer() {
    peer = new Peer(user.uid, config);

    peer.on('open', (id) => {
        console.log(`Peer connected with ID: ${id}`);
        updateUserStatus(true, false);
    });
    peer.on('iceConnectionStateChange', () => {
      console.log(`ICE Connection State: ${peer.iceConnectionState}`);
    });
    // Handle incoming call
    peer.on('call', (incomingCall) => {
        console.log('Incoming call received...');
        hideLoadingOverlay();
        updateUserStatus(true, true);
        incomingCall.answer(localStream);

        // incomingCall.on('stream', (remoteStream) => {
        //     remoteVideo.srcObject = remoteStream;
        //     console.log('Remote stream received.');
        // });

        incomingCall.on('stream', (remoteStream) => {
          try {
            if (remoteStream) {
              console.log('Remote stream tracks:', remoteStream.getTracks());
              remoteVideo.srcObject = remoteStream;
              remoteVideo.play().catch(e => console.error('Video play error:', e));
              console.log('Remote stream received.');
            } else {
              console.error('Remote stream is null');
            }
          } catch (error) {
            console.error('Error setting remote stream:', error);
          }
        }); //now
        

        incomingCall.on('close', () => {
            console.log('Call ended.');
            showLoadingOverlay("The previous call has ended. Click next.");
            updateUserStatus(true, false);
        });

        incomingCall.on('error', (err) => {
            console.error('Call error:', err);
            updateUserStatus(true, false);
        });

        call = incomingCall;
    });

    // Handle PeerJS errors
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        alert(`Error: ${err.message}`);
        updateUserStatus(false, false);
    });
}

// Update user status in Firebase
function updateUserStatus(isOnline, inCall) {
    const userStatusRef = ref(database, `/users/${user.uid}`);
    set(userStatusRef, {
        email: user.email,
        status: isOnline ? 'online' : 'offline',
        inCall: inCall,
        peerId: user.uid,
    });

    // Remove user data when disconnected
    onDisconnect(userStatusRef).remove();
}

// Get local media stream
async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000, 
            },
        });

        localStream.getAudioTracks().forEach(track => {
            track.applyConstraints({
                advanced: [
                    { echoCancellation: true },
                    { noiseSuppression: true },
                    { autoGainControl: true },
                    { volume: 0.8 },
                ],
            });
        });

        localVideo.srcObject = localStream;
        localVideo.muted = true;
        console.log('Local stream acquired with enhanced audio constraints.');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera or microphone.');
    }
}



// Make an outgoing call to a random user
async function makeCall() {
    try {
        const randomUserId = await getRandomUserId();
        if (!randomUserId) {
            // alert('No available users to connect to. Please try again.');
            showLoadingOverlay("No available users to connect to. Please try again.");
            return;
        }

        connectionPeerId = randomUserId;
        // console.log(`Attempting to call user with ID: ${connectionPeerId}`);
        showLoadingOverlay("Connecting with a new user");
        call = peer.call(connectionPeerId, localStream);

        updateUserStatus(true, true);

        // call.on('stream', (remoteStream) => {
        //     remoteVideo.srcObject = remoteStream;
        //     console.log('Call established, remote stream received.');
        // });
        call.on('stream', (remoteStream) => { // now
          hideLoadingOverlay();
          try {
            if (remoteStream) {
              console.log('Remote stream tracks:', remoteStream.getTracks());
              remoteVideo.srcObject = remoteStream;
              remoteVideo.play().catch(e => console.error('Video play error:', e));
            } else {
              console.error('Remote stream is null');
            }
          } catch (error) {
            console.error('Error setting remote stream:', error);
          }
        }); // added now
        call.on('close', () => {
            console.log('Call ended.');
            showLoadingOverlay("The previous call has ended. Click Next.");
            updateUserStatus(true, false);
        });

        call.on('error', (err) => {
            console.error('Call error:', err);
            alert('Failed to establish call. Retrying...');
            setTimeout(makeCall, 2000); // Retry after 2 seconds
        });
    } catch (error) {
        console.error('Error making call:', error);
        updateUserStatus(true, false);
    }
}

// Fetch a random user's Peer ID from Firebase
async function getRandomUserId() {
    const usersRef = ref(database, '/users');
    const snapshot = await get(usersRef);
    const users = snapshot.val();

    const availableUsers = Object.values(users).filter(
        (u) => u.status === 'online' && u.inCall === false && u.peerId !== user.uid
    );

    if (availableUsers.length === 0) return null;

    // Pick a random user
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    return randomUser.peerId;
}

// Next Button: Handle skipping to the next user
nextButton.addEventListener('click', () => {
    console.log('Next button clicked.');
    if (call) {
        call.close();
        updateUserStatus(true, false);
    }
    makeCall();
});

// Logout Button: Handle user logout
logoutButton.addEventListener('click', () => {
    if (peer) {
        peer.destroy();
        console.log('Logged out and PeerJS instance destroyed.');
    }
    updateUserStatus(false, false);
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Handle disconnection gracefully
window.addEventListener('beforeunload', () => {
    if (call) {
        call.close();
    }
    updateUserStatus(false, false);
    if (peer) {
        peer.destroy();
    }
});

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', async () => {
    await getLocalStream();
    initializePeer();
});