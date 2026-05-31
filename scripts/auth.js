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
    const loginButton = document.getElementById("loginBtn");
    if (loginButton) {
        loginButton.addEventListener("click", login);
    }

    auth.onAuthStateChanged(handleAuthChange);
});

function handleAuthChange(user) {
    const wrapper = document.querySelector(".transition-wrapper");
    const loginContainer = document.querySelector(".login-container");

    if (!wrapper || !loginContainer) {
        return;
    }

    if (user) {
        if (justLoggedIn) {
            wrapper.classList.add("logged-in");
            justLoggedIn = false;
        } else {
            wrapper.classList.add("logged-in", "instant");
        }

        document.getElementById("loggedInContainer").style.display = "flex";
        const uid = user.email.split("@")[0];
        loadUserData(uid);

        setTimeout(() => {
            wrapper.classList.remove("instant");
        }, 50);
    } else {
        wrapper.classList.remove("logout-visible");
        loginContainer.style.visibility = "visible";
    }
}

function login() {
    setLoginButtonLoading(true);

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
                setLoginButtonLoading(false);
            });
        
    } else {
        errorMessage.textContent = "Please enter your 6-digit wedding pin";
        setLoginButtonLoading(false);
    }
}

// Cache user data locally and render immediately when possible.
function loadUserData(uid) {
    const cachedPartyName = localStorage.getItem(`userData_partyName`);
    if (cachedPartyName) {
        updateUIWithUserData(cachedPartyName);
    }

    db.collection("users").doc(uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            localStorage.setItem(`userData_${uid}`, JSON.stringify(data));
            localStorage.setItem(`userData_partyName`, data.party_name);
            updateUIWithUserData(data.party_name);
        } else {
            document.getElementById("error").textContent = "No user data found.";
            localStorage.removeItem(`userData_${uid}`);
            localStorage.removeItem(`userData_partyName`);
        }
    }).catch((error) => {
        console.error("Failed to load user data from Firestore", error);
        document.getElementById("error").textContent = "We couldn't load your invite right now. Please try again or contact Luke & Kay.";
        setLoginButtonLoading(false);
    });
}

function updateUIWithUserData(partyName) {
    const wrapper = document.querySelector(".transition-wrapper");
    wrapper.classList.add("logged-in", "logout-visible");

    document.getElementById("loggedInContainerPartyName").textContent = `Dear ${partyName},`;

    document.getElementById("loggedInContainer").style.display = "flex";

    document.getElementById("loggedInContainerPartyName").style.fontSize = "3.5vh";
    document.getElementById("loggedInContainerPartyName").style.lineHeight = "3.5vh";
    document.getElementById("error").textContent = "";
}

function logout() {
    const wrapper = document.querySelector(".transition-wrapper");
    document.querySelectorAll('.pin-input').forEach(pin => pin.value = '');

    if (typeof closeWater === 'function') {
        closeWater(
            document.querySelector('.wave-container'),
            document.getElementById('waterContent'),
            wrapper,
            document.querySelector('.wave-underlay')
        );
    }

    setLoginButtonLoading(false);
    wrapper.classList.remove("logged-in");
    wrapper.classList.remove("logout-visible");
    const logoutMenu = document.getElementById('logoutMenu');
    const logoutToggle = document.getElementById('logoutToggle');
    if (logoutMenu) {
        logoutMenu.classList.remove('open');
    }
    if (logoutToggle) {
        logoutToggle.setAttribute('aria-expanded', 'false');
    }

    const user = auth.currentUser;
    if (user) {
        localStorage.removeItem(`userData_${user.email.split("@")[0]}`);
        localStorage.removeItem(`userData_partyName`);
    }

    auth.signOut();

    setTimeout(() => {
        document.getElementById("loggedInContainerPartyName").textContent = "";
    }, 2000);
}

function setLoginButtonLoading(isLoading) {
    const loginBtn = document.getElementById("loginBtn");
    if (!loginBtn) {
        return;
    }

    loginBtn.innerHTML = isLoading ? "ENTERING" : "ENTER SITE";
    loginBtn.classList.toggle("entering-loader", isLoading);
    loginBtn.disabled = isLoading;
}
