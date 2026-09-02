// ==========================================
// NOVA DISASTER RESPONSE
// FIRESTORE + FIREBASE AUTHENTICATION
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyBcEkoZMt1KZdQ-ch6J1-7KKyQRO542ZRY",
  authDomain: "nova-disaster-response.firebaseapp.com",
  projectId: "nova-disaster-response",
  storageBucket: "nova-disaster-response.firebasestorage.app",
  messagingSenderId: "275029136991",
  appId: "1:275029136991:web:382543b5ef90263b8364a"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let userLocation = "Location nahi mili";

let allReports = [];


// ==========================================
// REPORT MODAL
// ==========================================

function openReportForm() {

  const modal = document.getElementById("reportModal");

  if (modal) {
    modal.style.display = "block";
  }

}


function openSOSForm() {

  openReportForm();

  setTimeout(() => {

    const emergencyType =
      document.getElementById("emergencyType");

    if (emergencyType) {
      emergencyType.focus();
    }

  }, 100);

}


function closeReportForm() {

  const modal = document.getElementById("reportModal");

  if (modal) {
    modal.style.display = "none";
  }

}


window.openReportForm = openReportForm;
window.openSOSForm = openSOSForm;
window.closeReportForm = closeReportForm;


// ==========================================
// LOCATION
// ==========================================

function getLocation() {

  const status =
    document.getElementById("locationStatus");


  if (!navigator.geolocation) {

    status.innerText =
      "Browser location support nahi karta.";

    return;
  }


  status.innerText =
    "Location le rahe hain... 📍";


  navigator.geolocation.getCurrentPosition(

    function (position) {

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;


      userLocation =
        latitude.toFixed(5) +
        ", " +
        longitude.toFixed(5);


      status.innerText =
        "Location mil gayi ✅";

    },


    function () {

      status.innerText =
        "Location allow nahi hui.";

    }

  );

}


window.getLocation = getLocation;


// ==========================================
// SUBMIT REPORT
// ==========================================

const emergencyForm =
  document.getElementById("emergencyForm");


if (emergencyForm) {

  emergencyForm.addEventListener(
    "submit",

    async function (event) {

      event.preventDefault();


      const name =
        document.getElementById("name").value;


      const type =
        document.getElementById("emergencyType").value;


      const description =
        document.getElementById("description").value;


      try {

        await addDoc(
          collection(db, "reports"),

          {
            name: name,
            type: type,
            description: description,
            location: userLocation,
            status: "Active",
            timestamp: Date.now(),
            time: new Date().toLocaleString()
          }
        );


        alert(
          "Emergency Report submit ho gayi! 🚨"
        );


        emergencyForm.reset();


        userLocation =
          "Location nahi mili";


        document.getElementById(
          "locationStatus"
        ).innerText = "";


        closeReportForm();

      }


      catch (error) {

        console.error(
          "Report Error:",
          error
        );


        alert(
          "Report submit nahi hui: " +
          error.message
        );

      }

    }
  );

}


// ==========================================
// FIRESTORE REAL TIME LISTENER
// ==========================================

function listenToReports() {

  const reportsQuery = query(

    collection(db, "reports"),

    orderBy("timestamp", "desc")

  );


  onSnapshot(

    reportsQuery,


    function (snapshot) {

      allReports = [];


      snapshot.forEach(
        function (document) {

          allReports.push({
            id: document.id,
            ...document.data()
          });

        }
      );


      showReports();

    },


    function (error) {

      console.error(
        "Firestore Error:",
        error
      );

    }

  );

}


// ==========================================
// SHOW REPORTS
// ==========================================

function showReports() {

  const container =
    document.getElementById(
      "reportsContainer"
    );


  if (!container) return;


  // COUNTERS

  const reportCount =
    document.getElementById("reportCount");

  const totalReports =
    document.getElementById("totalReports");

  const activeCounter =
    document.getElementById("activeReports");

  const resolvedCounter =
    document.getElementById("resolvedReports");


  if (reportCount) {

    reportCount.innerText =
      allReports.length;

  }


  if (totalReports) {

    totalReports.innerText =
      allReports.length;

  }


  const activeReports =
    allReports.filter(
      report =>
        report.status === "Active"
    );


  const resolvedReports =
    allReports.filter(
      report =>
        report.status === "Resolved"
    );


  if (activeCounter) {

    activeCounter.innerText =
      activeReports.length;

  }


  if (resolvedCounter) {

    resolvedCounter.innerText =
      resolvedReports.length;

  }


  // FILTER

  const filterElement =
    document.getElementById(
      "reportFilter"
    );


  let selectedFilter = "All";


  if (filterElement) {

    selectedFilter =
      filterElement.value;

  }


  let filteredReports =
    allReports;


  if (selectedFilter !== "All") {

    filteredReports =
      allReports.filter(
        report =>
          report.type === selectedFilter
      );

  }


  // NO REPORTS

  if (filteredReports.length === 0) {

    container.innerHTML = `
      <p class="no-report">
        Abhi koi report nahi hai.
      </p>
    `;

    return;
  }


  container.innerHTML = "";


  // REPORT CARDS

  filteredReports.forEach(
    function (report) {

      const card =
        document.createElement("div");


      card.className =
        "report-card";


      const statusClass =
        report.status === "Active"
          ? "active-status"
          : "resolved-status";


      let statusButton = "";


      if (report.status === "Active") {

        statusButton = `
          <button
            class="resolve-btn"
            onclick="toggleStatus('${report.id}')"
          >
            ✅ Mark Resolved
          </button>
        `;

      }


      else {

        statusButton = `
          <button
            class="active-btn"
            onclick="toggleStatus('${report.id}')"
          >
            🔄 Mark Active
          </button>
        `;

      }


      card.innerHTML = `

        <div class="report-top">

          <h3>
            🚨 ${report.type}
          </h3>

          <span class="status-badge ${statusClass}">
            ${report.status}
          </span>

        </div>


        <p>
          <strong>Name:</strong>
          ${report.name}
        </p>


        <p>
          <strong>Problem:</strong>
          ${report.description}
        </p>


        <p>
          <strong>Location:</strong>
          ${report.location}
        </p>


        <p>
          <strong>Time:</strong>
          ${report.time}
        </p>


        <div class="report-actions">

          ${statusButton}


          <button
            class="delete-btn"
            onclick="deleteReport('${report.id}')"
          >
            🗑️ Delete
          </button>

        </div>

      `;


      container.appendChild(card);

    }
  );

}


// ==========================================
// TOGGLE STATUS
// ==========================================

async function toggleStatus(id) {

  try {

    const report =
      allReports.find(
        report =>
          report.id === id
      );


    if (!report) return;


    const newStatus =
      report.status === "Active"
        ? "Resolved"
        : "Active";


    await updateDoc(

      doc(db, "reports", id),

      {
        status: newStatus
      }

    );

  }


  catch (error) {

    console.error(error);

    alert(
      "Status update nahi hua."
    );

  }

}


window.toggleStatus =
  toggleStatus;


// ==========================================
// DELETE REPORT
// ==========================================

async function deleteReport(id) {

  const confirmDelete = confirm(
    "Pakki baat? Ye report permanently delete ho jayegi."
  );


  if (!confirmDelete) return;


  try {

    await deleteDoc(
      doc(db, "reports", id)
    );

  }


  catch (error) {

    console.error(error);

    alert(
      "Report delete nahi hui."
    );

  }

}


window.deleteReport =
  deleteReport;


// ==========================================
// FILTER REPORTS
// ==========================================

function filterReports() {

  showReports();

}


window.filterReports =
  filterReports;


// ==========================================
// CLEAR ALL REPORTS
// ==========================================

async function clearAllReports() {

  const confirmClear = confirm(
    "Saari reports permanently delete ho jayengi. Sure ho?"
  );


  if (!confirmClear) return;


  try {

    for (const report of allReports) {

      await deleteDoc(
        doc(db, "reports", report.id)
      );

    }

  }


  catch (error) {

    console.error(error);

    alert(
      "Reports delete nahi hui."
    );

  }

}


window.clearAllReports =
  clearAllReports;


// ==========================================
// LOGIN MODAL
// ==========================================

function openLoginModal() {

  console.log("Opening Login Modal");


  const modal =
    document.getElementById("loginModal");


  if (modal) {

    modal.style.display =
      "block";

  }

}


function closeLoginModal() {

  const modal =
    document.getElementById("loginModal");


  if (modal) {

    modal.style.display =
      "none";

  }

}


window.openLoginModal =
  openLoginModal;

window.closeLoginModal =
  closeLoginModal;


// ==========================================
// SIGNUP MODAL
// ==========================================

function openSignupModal() {

  const modal =
    document.getElementById("signupModal");


  if (modal) {

    modal.style.display =
      "block";

  }

}


function closeSignupModal() {

  const modal =
    document.getElementById("signupModal");


  if (modal) {

    modal.style.display =
      "none";

  }

}


window.openSignupModal =
  openSignupModal;

window.closeSignupModal =
  closeSignupModal;


// ==========================================
// EMAIL SIGNUP
// ==========================================

async function signupUser() {

  console.log(
    "Create Account button clicked"
  );


  const name =
    document.getElementById(
      "signupName"
    ).value.trim();


  const email =
    document.getElementById(
      "signupEmail"
    ).value.trim();


  const password =
    document.getElementById(
      "signupPassword"
    ).value;


  if (!email || !password) {

    alert(
      "Email aur password fill karo!"
    );

    return;

  }


  if (password.length < 6) {

    alert(
      "Password minimum 6 characters ka hona chahiye!"
    );

    return;

  }


  try {

    const userCredential =
      await createUserWithEmailAndPassword(

        auth,
        email,
        password

      );


    // SAVE USER NAME

    if (name) {

      await updateProfile(
        userCredential.user,
        {
          displayName: name
        }
      );

    }


    console.log(
      "Account Created:",
      userCredential.user.email
    );


    alert(
      "Account successfully create ho gaya! 🎉"
    );


    closeSignupModal();


    document.getElementById(
      "signupForm"
    ).reset();


  }


  catch (error) {

    console.error(
      "Signup Error:",
      error.code,
      error.message
    );


    if (
      error.code === "auth/email-already-in-use"
    ) {

      alert(
        "Is email se account already bana hua hai. Login karo!"
      );

    }


    else {

      alert(
        "Signup failed: " +
        error.message
      );

    }

  }

}


window.signupUser =
  signupUser;


// ==========================================
// EMAIL LOGIN
// ==========================================

async function loginUser() {

  console.log(
    "Login button clicked!"
  );


  const email =
    document.getElementById(
      "loginEmail"
    ).value.trim();


  const password =
    document.getElementById(
      "loginPassword"
    ).value;


  console.log(
    "Trying login:",
    email
  );


  if (!email || !password) {

    alert(
      "Email aur password fill karo!"
    );

    return;

  }


  try {

    const userCredential =
      await signInWithEmailAndPassword(

        auth,
        email,
        password

      );


    console.log(
      "Login Successful:",
      userCredential.user.email
    );


    alert(
      "Login successful! 🚀"
    );


    closeLoginModal();


    document.getElementById(
      "loginForm"
    ).reset();


  }


  catch (error) {

    console.error(
      "LOGIN ERROR:",
      error.code,
      error.message
    );


    if (
      error.code === "auth/invalid-credential"
    ) {

      alert(
        "Email ya password galat hai!"
      );

    }


    else {

      alert(
        "Login failed: " +
        error.message
      );

    }

  }

}


window.loginUser =
  loginUser;


// ==========================================
// GOOGLE LOGIN
// ==========================================

async function googleLogin() {

  console.log(
    "Google Login Started"
  );


  try {

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );


    console.log(
      "Google Login Successful:",
      result.user.email
    );


    closeLoginModal();

    closeSignupModal();


  }


  catch (error) {

    console.error(
      "Google Login Error:",
      error.code,
      error.message
    );


    alert(
      "Google login failed: " +
      error.message
    );

  }

}


window.googleLogin =
  googleLogin;


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

  try {

    await signOut(auth);


    alert(
      "Logout successful! 👋"
    );

  }


  catch (error) {

    console.error(error);


    alert(
      "Logout failed."
    );

  }

}


window.logoutUser =
  logoutUser;


// ==========================================
// AUTH STATE LISTENER
// ==========================================

onAuthStateChanged(

  auth,

  function (user) {

    const authButtons =
      document.getElementById(
        "authButtons"
      );


    const userProfile =
      document.getElementById(
        "userProfile"
      );


    const userName =
      document.getElementById(
        "userName"
      );


    if (!authButtons ||
        !userProfile ||
        !userName) {

      return;

    }


    if (user) {

      console.log(
        "🔐 User logged in:",
        user.email
      );


      authButtons.style.display =
        "none";


      userProfile.style.display =
        "flex";


      userName.innerText =
        "👤 " +
        (
          user.displayName ||
          user.email
        );

    }


    else {

      console.log(
        "🔓 No user logged in"
      );


      authButtons.style.display =
        "flex";


      userProfile.style.display =
        "none";

    }

  }

);


// ==========================================
// OUTSIDE MODAL CLICK
// ==========================================

window.addEventListener(

  "click",

  function (event) {

    const reportModal =
      document.getElementById(
        "reportModal"
      );


    const loginModal =
      document.getElementById(
        "loginModal"
      );


    const signupModal =
      document.getElementById(
        "signupModal"
      );


    if (event.target === reportModal) {

      closeReportForm();

    }


    if (event.target === loginModal) {

      closeLoginModal();

    }


    if (event.target === signupModal) {

      closeSignupModal();

    }

  }

);


// ==========================================
// START FIRESTORE
// ==========================================

listenToReports();


// ==========================================
// CONSOLE STATUS
// ==========================================

console.log(
  "🚀 NOVA Firestore Connected"
);

console.log(
  "🔐 NOVA Firebase Authentication Connected"
);
