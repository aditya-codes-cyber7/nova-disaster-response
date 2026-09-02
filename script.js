// ==========================================
// NOVA DISASTER RESPONSE - PHASE 4 FINAL
// Firebase Auth + User Based Reports + Admin
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
  orderBy,
  where,
  serverTimestamp
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
// ADMIN CONFIG
// IMPORTANT: CHANGE THIS EMAIL
// ==========================================

const ADMIN_EMAIL = "aditya9288raj@gmail.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let currentUserIsAdmin = false;

let userLocation = "Location not available";

let allReports = [];

let unsubscribeReports = null;


// ==========================================
// HELPERS
// ==========================================

function isAdmin(user) {

  if (!user) return false;

  return user.email === ADMIN_EMAIL;

}


function getUserDisplayName(user) {

  if (!user) return "User";

  return (
    user.displayName ||
    user.email?.split("@")[0] ||
    "User"
  );

}


// ==========================================
// REPORT MODAL
// ==========================================

function openReportForm() {

  if (!currentUser) {

    alert("Please login first to submit an emergency report.");

    openLoginModal();

    return;

  }

  const modal =
    document.getElementById("reportModal");

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

  }, 200);

}


function closeReportForm() {

  const modal =
    document.getElementById("reportModal");

  if (modal) {
    modal.style.display = "none";
  }

}


window.openReportForm = openReportForm;
window.openSOSForm = openSOSForm;
window.closeReportForm = closeReportForm;


// ==========================================
// GET LOCATION
// ==========================================

function getLocation() {

  const status =
    document.getElementById("locationStatus");

  if (!navigator.geolocation) {

    if (status) {
      status.innerText =
        "Browser does not support location.";
    }

    return;

  }

  if (status) {
    status.innerText =
      "Getting your location... 📍";
  }

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

      if (status) {
        status.innerText =
          "Location added successfully ✅";
      }

    },

    function () {

      if (status) {
        status.innerText =
          "Location permission denied.";
      }

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


      if (!currentUser) {

        alert("Please login first.");

        closeReportForm();

        openLoginModal();

        return;

      }


      const name =
        document.getElementById("name").value.trim();


      const type =
        document.getElementById("emergencyType").value;


      const description =
        document.getElementById("description").value.trim();


      if (!name || !type || !description) {

        alert("Please fill all required details.");

        return;

      }


      try {

        await addDoc(

          collection(db, "reports"),

          {

            // REPORT DETAILS
            name: name,
            type: type,
            description: description,
            location: userLocation,

            // OWNER DETAILS
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: getUserDisplayName(currentUser),

            // ADMIN ONLY STATUS
            status: "Active",

            // TIMESTAMP
            timestamp: Date.now(),
            createdAt: serverTimestamp(),

            time:
              new Date().toLocaleString()

          }

        );


        alert(
          "Emergency report submitted successfully! 🚨"
        );


        emergencyForm.reset();


        userLocation =
          "Location not available";


        const locationStatus =
          document.getElementById("locationStatus");


        if (locationStatus) {
          locationStatus.innerText = "";
        }


        closeReportForm();

      }


      catch (error) {

        console.error(
          "Report Error:",
          error
        );


        alert(
          "Report submission failed: " +
          error.message
        );

      }

    }

  );

}


// ==========================================
// FIRESTORE REPORT LISTENER
// ==========================================

function listenToReports() {

  // Stop previous listener

  if (unsubscribeReports) {

    unsubscribeReports();

    unsubscribeReports = null;

  }


  if (!currentUser) {

    allReports = [];

    showReports();

    return;

  }


  let reportsQuery;


  // ADMIN SEES ALL REPORTS

  if (currentUserIsAdmin) {

    reportsQuery = query(

      collection(db, "reports"),

      orderBy("timestamp", "desc")

    );

  }


  // NORMAL USER SEES ONLY OWN REPORTS

  else {

    reportsQuery = query(

      collection(db, "reports"),

      where(
        "userId",
        "==",
        currentUser.uid
      ),

      orderBy("timestamp", "desc")

    );

  }


  unsubscribeReports = onSnapshot(

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
        "Firestore Listener Error:",
        error
      );

    }

  );

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboardCounters() {

  const reportCount =
    document.getElementById("reportCount");

  const totalReports =
    document.getElementById("totalReports");

  const activeCounter =
    document.getElementById("activeReports");

  const resolvedCounter =
    document.getElementById("resolvedReports");


  // USER TOTAL = OWN REPORTS
  // ADMIN TOTAL = ALL REPORTS

  if (reportCount) {

    reportCount.innerText =
      allReports.length;

  }


  if (totalReports) {

    totalReports.innerText =
      allReports.length;

  }


  // Only admin should see status data

  if (!currentUserIsAdmin) {

    if (activeCounter) {
      activeCounter.innerText = "-";
    }

    if (resolvedCounter) {
      resolvedCounter.innerText = "-";
    }

    return;

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

}


// ==========================================
// SHOW REPORTS
// ==========================================

function showReports() {

  const container =
    document.getElementById("reportsContainer");


  if (!container) return;


  updateDashboardCounters();


  // NOT LOGGED IN

  if (!currentUser) {

    container.innerHTML = `
      <p class="no-report">
        🔐 Login to view your emergency reports.
      </p>
    `;

    return;

  }


  // FILTER

  const filterElement =
    document.getElementById("reportFilter");


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
        ${currentUserIsAdmin
          ? "No emergency reports found."
          : "You have not submitted any emergency reports yet."
        }
      </p>
    `;

    return;

  }


  container.innerHTML = "";


  filteredReports.forEach(

    function (report) {

      const card =
        document.createElement("div");


      card.className =
        "report-card";


      // ======================================
      // ADMIN VIEW
      // ======================================

      if (currentUserIsAdmin) {

        const statusClass =
          report.status === "Active"
            ? "active-status"
            : "resolved-status";


        const statusButton =
          report.status === "Active"

            ? `
              <button
                class="resolve-btn"
                onclick="toggleStatus('${report.id}')"
              >
                ✅ Mark Resolved
              </button>
            `

            : `
              <button
                class="active-btn"
                onclick="toggleStatus('${report.id}')"
              >
                🔄 Mark Active
              </button>
            `;


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
            <strong>Reported By:</strong>
            ${report.name}
          </p>

          <p>
            <strong>User Email:</strong>
            ${report.userEmail || "Not available"}
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

      }


      // ======================================
      // NORMAL USER VIEW
      // ======================================

      else {

        card.innerHTML = `

          <div class="report-top">

            <h3>
              🚨 ${report.type}
            </h3>

            <span class="my-report-badge">
              Your Report
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
            <strong>Submitted:</strong>
            ${report.time}
          </p>

          <p class="report-info">
            ℹ️ Your emergency request has been securely submitted.
            Response status is managed by the emergency administration.
          </p>

        `;

      }


      container.appendChild(card);

    }

  );

}


// ==========================================
// TOGGLE REPORT STATUS
// ADMIN ONLY
// ==========================================

async function toggleStatus(id) {

  if (!currentUserIsAdmin) {

    alert(
      "Only admin can change report status."
    );

    return;

  }


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
      "Status update failed."
    );

  }

}


window.toggleStatus =
  toggleStatus;


// ==========================================
// DELETE REPORT
// ADMIN ONLY
// ==========================================

async function deleteReport(id) {

  if (!currentUserIsAdmin) {

    alert(
      "Only admin can delete reports."
    );

    return;

  }


  const confirmDelete = confirm(
    "Are you sure? This report will be permanently deleted."
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
      "Report deletion failed."
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
// ADMIN ONLY
// ==========================================

async function clearAllReports() {

  if (!currentUserIsAdmin) {

    alert(
      "Only admin can clear reports."
    );

    return;

  }


  const confirmClear = confirm(
    "Delete ALL emergency reports permanently?"
  );


  if (!confirmClear) return;


  try {

    for (const report of allReports) {

      await deleteDoc(
        doc(db, "reports", report.id)
      );

    }


    alert(
      "All reports cleared."
    );

  }


  catch (error) {

    console.error(error);

    alert(
      "Reports could not be cleared."
    );

  }

}


window.clearAllReports =
  clearAllReports;


// ==========================================
// LOGIN MODAL
// ==========================================

function openLoginModal() {

  const modal =
    document.getElementById("loginModal");


  if (modal) {

    modal.style.display = "block";

  }

}


function closeLoginModal() {

  const modal =
    document.getElementById("loginModal");


  if (modal) {

    modal.style.display = "none";

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

    modal.style.display = "block";

  }

}


function closeSignupModal() {

  const modal =
    document.getElementById("signupModal");


  if (modal) {

    modal.style.display = "none";

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

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;


  if (!email || !password) {

    alert(
      "Please fill email and password."
    );

    return;

  }


  if (password.length < 6) {

    alert(
      "Password must contain at least 6 characters."
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


    if (name) {

      await updateProfile(

        userCredential.user,

        {
          displayName: name
        }

      );

    }


    alert(
      "Account created successfully! 🎉"
    );


    closeSignupModal();


    const signupForm =
      document.getElementById("signupForm");


    if (signupForm) {

      signupForm.reset();

    }

  }


  catch (error) {

    console.error(
      "Signup Error:",
      error
    );


    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      alert(
        "This email already has an account. Please login."
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

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  if (!email || !password) {

    alert(
      "Please fill email and password."
    );

    return;

  }


  try {

    await signInWithEmailAndPassword(

      auth,
      email,
      password

    );


    alert(
      "Login successful! 🚀"
    );


    closeLoginModal();


    const loginForm =
      document.getElementById("loginForm");


    if (loginForm) {

      loginForm.reset();

    }

  }


  catch (error) {

    console.error(
      "Login Error:",
      error
    );


    if (
      error.code ===
      "auth/invalid-credential"
    ) {

      alert(
        "Incorrect email or password."
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

  try {

    await signInWithPopup(

      auth,
      googleProvider

    );


    closeLoginModal();

    closeSignupModal();


    alert(
      "Google login successful! 🎉"
    );

  }


  catch (error) {

    console.error(
      "Google Login Error:",
      error
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
// UPDATE UI BY ROLE
// ==========================================

function updateRoleUI() {

  const clearButton =
    document.querySelector(".clear-btn");


  const dashboardHeading =
    document.querySelector(
      ".dashboard-heading p:not(.tag)"
    );


  if (currentUserIsAdmin) {

    if (clearButton) {
      clearButton.style.display = "block";
    }


    if (dashboardHeading) {
      dashboardHeading.innerText =
        "Admin dashboard - monitoring all emergency reports.";
    }

  }


  else {

    if (clearButton) {
      clearButton.style.display = "none";
    }


    if (dashboardHeading) {
      dashboardHeading.innerText =
        "Your personal emergency report overview.";
    }

  }

}


// ==========================================
// AUTH STATE LISTENER
// ==========================================

onAuthStateChanged(

  auth,

  function (user) {

    const authButtons =
      document.getElementById("authButtons");

    const userProfile =
      document.getElementById("userProfile");

    const userName =
      document.getElementById("userName");


    currentUser = user;

    currentUserIsAdmin =
      isAdmin(user);


    // ======================================
    // USER LOGGED IN
    // ======================================

    if (user) {

      console.log(
        "User logged in:",
        user.email
      );


      console.log(
        "Is Admin:",
        currentUserIsAdmin
      );


      if (authButtons) {

        authButtons.style.display = "none";

      }


      if (userProfile) {

        userProfile.style.display = "flex";

      }


      if (userName) {

        const roleText =
          currentUserIsAdmin
            ? "ADMIN"
            : "USER";


        userName.innerText =
          `👤 ${getUserDisplayName(user)} (${roleText})`;

      }


      updateRoleUI();


      listenToReports();

    }


    // ======================================
    // USER LOGGED OUT
    // ======================================

    else {

      console.log(
        "No user logged in"
      );


      if (authButtons) {

        authButtons.style.display = "flex";

      }


      if (userProfile) {

        userProfile.style.display = "none";

      }


      currentUserIsAdmin = false;


      updateRoleUI();


      if (unsubscribeReports) {

        unsubscribeReports();

        unsubscribeReports = null;

      }


      allReports = [];


      showReports();

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
      document.getElementById("reportModal");

    const loginModal =
      document.getElementById("loginModal");

    const signupModal =
      document.getElementById("signupModal");


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
// START
// ==========================================

console.log(
  "🚨 NOVA Disaster Response - Phase 4 Ready"
);

console.log(
  "🔐 Authentication Enabled"
);

console.log(
  "👤 User Based Reports Enabled"
);

console.log(
  "🛡️ Admin Role System Enabled"
);
