const firebaseConfig = {
    apiKey: "AIzaSyC_GHK_OkoGNSM-0zLyNEbdydA-CDmirbY",
    authDomain: "lukeandkaywedding.firebaseapp.com",
    projectId: "lukeandkaywedding",
    storageBucket: "lukeandkaywedding.firebasestorage.app",
    messagingSenderId: "653823840290",
    appId: "1:653823840290:web:a4bf7c23ac282f45333a7b",
    measurementId: "G-Q7E7FJW387"
};
  
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let justLoggedIn = false;


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("loginBtn").addEventListener("click", login);
    auth.onAuthStateChanged(user => {
        if (user) {
            const password = user.email.split("@")[0];
            loadUserData(password);
        };
    });
});

auth.onAuthStateChanged(user => {
    if (user) {
        const wrapper = document.querySelector(".transition-wrapper");
        console.log(user)

        if (justLoggedIn) {
            wrapper.classList.add("logged-in");
            justLoggedIn = false;  // reset flag after use
        } else {
            console.log(user)
            wrapper.classList.add("logged-in", "instant");
        }

        document.getElementById("loggedInContainer").style.display = "flex";
        const uid = user.email.split("@")[0];
        loadUserData(uid);
        setTimeout(() => {
            wrapper.classList.remove("instant");
        }, 50);
    } else {
        document.querySelector(".login-container").style.visibility = "visible";
    };
});


function login() {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.innerHTML = "ENTERING";
    loginBtn.classList.add("entering-loader");
    loginBtn.disabled = true;

    const errorMessage = document.getElementById("error");
    const pins = document.querySelectorAll('.pin-input');
    const password = Array.from(pins).map(pin => pin.value).join('');
    const email = `${password}@lukeandkay.co.uk`;

    if (password.length === 6) {
        justLoggedIn = true;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                loadUserData(password);
            }).catch(() => {
                errorMessage.textContent = "Invalid wedding pin";
                loginBtn.innerHTML = "ENTER SITE";
                loginBtn.classList.remove("entering-loader");
                loginBtn.disabled = false;
            });
        
    } else {
        errorMessage.textContent = "Please enter your 6-digit wedding pin";
        loginBtn.innerHTML = "ENTER SITE";
        loginBtn.classList.remove("entering-loader");
        loginBtn.disabled = false;
    };
};


function loadUserData(uid) {
    const cachedData = localStorage.getItem(`userData_partyName`);
    // const cachedData = localStorage.getItem(`userData_${uid}`);
    if (cachedData) {
        // const data = JSON.parse(cachedData);
        updateUIWithUserData(cachedData);
    };

    db.collection("users").doc(uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            // Cache it locally
            localStorage.setItem(`userData_${uid}`, JSON.stringify(data));
            localStorage.setItem(`userData_partyName`, data.party_name);
            updateUIWithUserData(data.party_name);
        } else {
            document.getElementById("error").textContent = "No user data found.";
            localStorage.removeItem(`userData_${uid}`);
            localStorage.removeItem(`userData_partyName`);
        }
    });
};


function updateUIWithUserData(partyName) {
    const wrapper = document.querySelector(".transition-wrapper");
    wrapper.classList.add("logged-in");

    document.getElementById("loggedInContainerPartyName").textContent = `Dear ${partyName},`;
    // document.getElementById("loggedInContainerPartyName").textContent = `Dear ${data.party_name},`;

    setTimeout(() => {
        document.getElementById("loggedInContainer").style.display = "flex";
    }, 800);

    document.getElementById("loggedInContainerPartyName").style.fontSize = "3.5vh";
    document.getElementById("loggedInContainerPartyName").style.lineHeight = "3.5vh";
    document.getElementById("error").textContent = "";
};


function logout() {
    const wrapper = document.querySelector(".transition-wrapper");
    document.querySelectorAll('.pin-input').forEach(pin => pin.value = '');

    const loginBtn = document.getElementById("loginBtn");
    loginBtn.innerHTML = "ENTER SITE";
    loginBtn.classList.remove("entering-loader");
    loginBtn.disabled = false;

    wrapper.classList.remove("logged-in");

    // Clear cached user data
    const user = auth.currentUser;
    if (user) {
        localStorage.removeItem(`userData_${user.email.split("@")[0]}`);
        localStorage.removeItem(`userData_partyName`);
    }

    auth.signOut();

    setTimeout(() => {
        document.getElementById("loggedInContainerPartyName").textContent = ""
    }, 2000);
}