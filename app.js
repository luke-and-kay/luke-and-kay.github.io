// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_GHK_OkoGNSM-0zLyNEbdydA-CDmirbY",
  authDomain: "lukeandkaywedding.firebaseapp.com",
  projectId: "lukeandkaywedding",
  storageBucket: "lukeandkaywedding.firebasestorage.app",
  messagingSenderId: "653823840290",
  appId: "1:653823840290:web:a4bf7c23ac282f45333a7b",
  measurementId: "G-Q7E7FJW387"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Login handler
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});

function login() {
  console.log("Yippee!")
  const password = document.getElementById("weddingPin").value;
  const email = `${password}@lukeandkay.co.uk`;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = `super-secret-main.html?uid=${password}`;
    })
    .catch(() => {
      document.getElementById("error").textContent = "Invalid password.";
    });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "super-secret-index.html";
  });
}

// Load user data on main page
if (window.location.pathname.includes("super-secret-main.html")) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "super-secret-index.html";
    } else {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid");

      db.collection("users").doc(uid).get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("welcome").textContent = `Welcome, ${data.name}`;
          document.getElementById("details").textContent = `Your guest type: ${data.guest_type}`;
        } else {
          document.getElementById("welcome").textContent = "No user data found.";
        }
      });
    }
  });
}