// ==========================================
// NOVA DISASTER RESPONSE
// FINAL SCRIPT.JS
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// ADMIN CONFIGURATION
// ==========================================

const ADMIN_EMAIL = "adi56tya65raj00@gmail.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let isAdmin = false;

let userReports = [];

let currentLocation = null;

let unsubscribeReports = null;

let unsubscribeFeedback = null;

let feedbackList = [];


// ==========================================
// DOM ELEMENTS
// ==========================================

const authButtons =
  document.getElementById("authButtons");

const userProfile =
  document.getElementById("userProfile");

const userName =
  document.getElementById("userName");

const reportsContainer =
  document.getElementById("reportsContainer");

const reportCount =
  document.getElementById("reportCount");

const totalReports =
  document.getElementById("totalReports");

const activeReports =
  document.getElementById("activeReports");

const resolvedReports =
  document.getElementById("resolvedReports");

const clearButton =
  document.querySelector(".clear-btn");


// ==========================================
// AUTH STATE LISTENER
// ==========================================

onAuthStateChanged(auth, (user) => {

  currentUser = user;


  // ==========================================
  // USER LOGGED IN
  // ==========================================

  if (user) {

    isAdmin =
      user.email &&
      user.email.toLowerCase() ===
      ADMIN_EMAIL.toLowerCase();


    // Show profile

    if (authButtons) {
      authButtons.style.display = "none";
    }

    if (userProfile) {
      userProfile.style.display = "flex";
    }


    // Display name

    const displayName =
      user.displayName ||
      user.email.split("@")[0];


    if (userName) {

      if (isAdmin) {

        userName.textContent =
          `${displayName} 🛡️ ADMIN`;

      } else {

        userName.textContent =
          `${displayName} 👤`;

      }

    }


    // Admin clear button

    if (clearButton) {

      if (isAdmin) {

        clearButton.style.display =
          "block";

      } else {

        clearButton.style.display =
          "none";

      }

    }


    // Load reports

    loadReports();


    // Load feedback for admin

    if (isAdmin) {

      loadFeedback();

    }


  }


  // ==========================================
  // USER LOGGED OUT
  // ==========================================

  else {

    currentUser = null;

    isAdmin = false;

    userReports = [];

    feedbackList = [];


    if (authButtons) {
      authButtons.style.display = "flex";
    }

    if (userProfile) {
      userProfile.style.display = "none";
    }

    if (clearButton) {
      clearButton.style.display = "none";
    }


    // Stop reports listener

    if (unsubscribeReports) {

      unsubscribeReports();

      unsubscribeReports = null;

    }


    // Stop feedback listener

    if (unsubscribeFeedback) {

      unsubscribeFeedback();

      unsubscribeFeedback = null;

    }


    // Reset reports UI

    if (reportsContainer) {

      reportsContainer.innerHTML = `
        <p class="no-report">
          🔐 Login to view your emergency reports.
        </p>
      `;

    }


    updateDashboard([]);

  }

});


// ==========================================
// SIGNUP
// ==========================================

window.signupUser = async function () {

  const name =
    document.getElementById("signupName")
      .value
      .trim();

  const email =
    document.getElementById("signupEmail")
      .value
      .trim();

  const password =
    document.getElementById("signupPassword")
      .value;


  if (!email || !password) {

    alert(
      "Please enter email and password."
    );

    return;

  }


  if (password.length < 6) {

    alert(
      "Password must be at least 6 characters."
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


    document
      .getElementById("signupForm")
      .reset();


  } catch (error) {

    console.error(error);

    alert(
      error.message
    );

  }

};


// ==========================================
// LOGIN
// ==========================================

window.loginUser = async function () {

  const email =
    document.getElementById("loginEmail")
      .value
      .trim();

  const password =
    document.getElementById("loginPassword")
      .value;


  if (!email || !password) {

    alert(
      "Please enter email and password."
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


    document
      .getElementById("loginForm")
      .reset();


  } catch (error) {

    console.error(error);

    alert(
      "Login failed: " +
      error.message
    );

  }

};


// ==========================================
// GOOGLE LOGIN
// ==========================================

window.googleLogin = async function () {

  try {

    const provider =
      new GoogleAuthProvider();


    await signInWithPopup(
      auth,
      provider
    );


    closeLoginModal();

    closeSignupModal();


  } catch (error) {

    console.error(error);

    alert(
      "Google login failed: " +
      error.message
    );

  }

};


// ==========================================
// LOGOUT
// ==========================================

window.logoutUser = async function () {

  try {

    await signOut(auth);

    alert(
      "Logged out successfully."
    );

  } catch (error) {

    alert(
      error.message
    );

  }

};


// ==========================================
// LOAD REPORTS
// ==========================================

function loadReports() {

  if (!currentUser) return;


  // Remove old listener

  if (unsubscribeReports) {

    unsubscribeReports();

  }


  let reportsQuery;


  // ==========================================
  // ADMIN → ALL REPORTS
  // ==========================================

  if (isAdmin) {

    reportsQuery =
      collection(
        db,
        "reports"
      );

  }


  // ==========================================
  // NORMAL USER → ONLY OWN REPORTS
  // ==========================================

  else {

    reportsQuery =
      query(
        collection(db, "reports"),
        where(
          "userId",
          "==",
          currentUser.uid
        )
      );

  }


  // ==========================================
  // REALTIME LISTENER
  // ==========================================

  unsubscribeReports =
    onSnapshot(

      reportsQuery,

      (snapshot) => {

        userReports = [];


        snapshot.forEach(
          (documentSnapshot) => {

            userReports.push({

              id:
                documentSnapshot.id,

              ...documentSnapshot.data()

            });

          }
        );


        // Sort latest first

        userReports.sort(
          (a, b) => {

            const timeA =
              a.createdAt?.seconds || 0;

            const timeB =
              b.createdAt?.seconds || 0;

            return timeB - timeA;

          }
        );


        renderReports();

        updateDashboard(
          userReports
        );

      },


      (error) => {

        console.error(
          "Error loading reports:",
          error
        );


        if (reportsContainer) {

          reportsContainer.innerHTML = `
            <p class="no-report">
              Unable to load reports.
            </p>
          `;

        }

      }

    );

}


// ==========================================
// RENDER REPORTS
// ==========================================

function renderReports() {

  if (!currentUser) return;


  const filterElement =
    document.getElementById(
      "reportFilter"
    );


  const filter =
    filterElement
      ? filterElement.value
      : "All";


  let filteredReports =
    userReports;


  // Filter reports

  if (filter !== "All") {

    filteredReports =
      userReports.filter(
        (report) =>
          report.emergencyType === filter
      );

  }


  // No reports

  if (
    filteredReports.length === 0
  ) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        No emergency reports found.
      </p>
    `;

    return;

  }


  reportsContainer.innerHTML = "";


  // ==========================================
  // CREATE REPORT CARDS
  // ==========================================

  filteredReports.forEach(
    (report) => {

      const card =
        document.createElement("div");


      card.className =
        "report-card";


      // ======================================
      // DATE
      // ======================================

      let dateText =
        "Just now";


      if (report.createdAt) {

        const date =
          report.createdAt.toDate();

        dateText =
          date.toLocaleString();

      }


      // ======================================
      // LOCATION
      // ======================================

      let locationText =
        "Not shared";


      if (
        report.location &&
        typeof report.location.latitude === "number"
      ) {

        locationText =
          `${report.location.latitude.toFixed(4)},
           ${report.location.longitude.toFixed(4)}`;

      }


      // ======================================
      // STATUS
      // ======================================

      const status =
        report.status || "Pending";


      let statusClass =
        "pending-status";


      if (status === "Resolved") {

        statusClass =
          "resolved-status";

      }

      else if (status === "Active") {

        statusClass =
          "active-status";

      }


      // ======================================
      // ADMIN VIEW
      // ======================================

      if (isAdmin) {

        card.innerHTML = `

          <div class="report-top">

            <h3>
              ${escapeHTML(
                report.emergencyType
              )}
            </h3>

            <span
              class="status-badge ${statusClass}"
            >
              ${escapeHTML(status)}
            </span>

          </div>


          <p>
            <strong>Name:</strong>
            ${escapeHTML(report.name)}
          </p>


          <p>
            <strong>User Email:</strong>
            ${escapeHTML(
              report.userEmail || "Unknown"
            )}
          </p>


          <p>
            <strong>Description:</strong>
            ${escapeHTML(
              report.description
            )}
          </p>


          <p>
            <strong>Location:</strong>
            ${locationText}
          </p>


          <p>
            <strong>Submitted:</strong>
            ${dateText}
          </p>


          <div class="report-actions">


            <button
              class="pending-btn"
              onclick="changeReportStatus(
                '${report.id}',
                'Pending'
              )"
            >
              ⏳ Pending
            </button>


            <button
              class="active-btn"
              onclick="changeReportStatus(
                '${report.id}',
                'Active'
              )"
            >
              🔴 Active
            </button>


            <button
              class="resolve-btn"
              onclick="changeReportStatus(
                '${report.id}',
                'Resolved'
              )"
            >
              ✅ Resolve
            </button>


            <button
              class="delete-btn"
              onclick="deleteReport(
                '${report.id}'
              )"
            >
              🗑 Delete
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
              ${escapeHTML(
                report.emergencyType
              )}
            </h3>


            <span
              class="status-badge ${statusClass}"
            >
              ${escapeHTML(status)}
            </span>

          </div>


          <p>
            <strong>Name:</strong>
            ${escapeHTML(
              report.name
            )}
          </p>


          <p>
            <strong>Description:</strong>
            ${escapeHTML(
              report.description
            )}
          </p>


          <p>
            <strong>Location:</strong>
            ${locationText}
          </p>


          <p>
            <strong>Submitted:</strong>
            ${dateText}
          </p>


          <div class="case-status">

            <span>
              📋 Case Status
            </span>


            <span
              class="status-badge ${statusClass}"
            >
              ${escapeHTML(status)}
            </span>

          </div>

        `;

      }


      reportsContainer.appendChild(
        card
      );

    }

  );

}


// ==========================================
// FILTER REPORTS
// ==========================================

window.filterReports =
function () {

  renderReports();

};


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(reports) {

  const total =
    reports.length;


  let active = 0;

  let resolved = 0;


  reports.forEach(
    (report) => {

      const status =
        report.status || "Pending";


      if (
        status === "Resolved"
      ) {

        resolved++;

      }

      else {

        active++;

      }

    }
  );


  if (reportCount) {
    reportCount.textContent = total;
  }

  if (totalReports) {
    totalReports.textContent = total;
  }

  if (activeReports) {
    activeReports.textContent = active;
  }

  if (resolvedReports) {
    resolvedReports.textContent = resolved;
  }

}


// ==========================================
// CHANGE REPORT STATUS
// ADMIN ONLY
// ==========================================

window.changeReportStatus =
async function (
  reportId,
  newStatus
) {

  if (!isAdmin) {

    alert(
      "Admin access required."
    );

    return;

  }


  try {

    await updateDoc(

      doc(
        db,
        "reports",
        reportId
      ),

      {
        status:
          newStatus
      }

    );


    alert(
      `Report marked as ${newStatus}`
    );


  } catch (error) {

    console.error(error);

    alert(
      "Unable to update status."
    );

  }

};


// ==========================================
// DELETE REPORT
// ADMIN ONLY
// ==========================================

window.deleteReport =
async function (
  reportId
) {

  if (!isAdmin) {

    alert(
      "Admin access required."
    );

    return;

  }


  const confirmDelete =
    confirm(
      "Delete this report permanently?"
    );


  if (!confirmDelete) return;


  try {

    await deleteDoc(

      doc(
        db,
        "reports",
        reportId
      )

    );


  } catch (error) {

    console.error(error);

    alert(
      "Unable to delete report."
    );

  }

};


// ==========================================
// CLEAR ALL REPORTS
// ADMIN ONLY
// ==========================================

window.clearAllReports =
async function () {

  if (!isAdmin) {

    alert(
      "Admin access required."
    );

    return;

  }


  const confirmClear =
    confirm(
      "Are you sure you want to delete ALL reports?"
    );


  if (!confirmClear) return;


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "reports"
        )
      );


    const deletePromises = [];


    snapshot.forEach(
      (documentSnapshot) => {

        deletePromises.push(

          deleteDoc(
            doc(
              db,
              "reports",
              documentSnapshot.id
            )
          )

        );

      }
    );


    await Promise.all(
      deletePromises
    );


    alert(
      "All reports deleted."
    );


  } catch (error) {

    console.error(error);

    alert(
      "Unable to clear reports."
    );

  }

};


// ==========================================
// OPEN REPORT FORM
// ==========================================

window.openReportForm =
function () {

  if (!currentUser) {

    alert(
      "Please login first to submit an emergency report."
    );

    openLoginModal();

    return;

  }


  document.getElementById(
    "reportModal"
  ).style.display =
    "block";


  // Auto fill name

  const nameInput =
    document.getElementById(
      "name"
    );


  if (
    currentUser.displayName &&
    !nameInput.value
  ) {

    nameInput.value =
      currentUser.displayName;

  }

};


// ==========================================
// SOS OPENS REPORT FORM
// ==========================================

window.openSOSForm =
function () {

  openReportForm();

};


// ==========================================
// CLOSE REPORT FORM
// ==========================================

window.closeReportForm =
function () {

  document.getElementById(
    "reportModal"
  ).style.display =
    "none";

};


// ==========================================
// GET LOCATION
// ==========================================

window.getLocation =
function () {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (!navigator.geolocation) {

    status.textContent =
      "Geolocation is not supported.";

    return;

  }


  status.textContent =
    "Getting location...";


  navigator.geolocation.getCurrentPosition(

    (position) => {

      currentLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      };


      status.textContent =
        "📍 Location added successfully.";

    },


    (error) => {

      console.error(error);


      status.textContent =
        "Unable to get location.";

    }

  );

};


// ==========================================
// SUBMIT EMERGENCY REPORT
// ==========================================

document
  .getElementById(
    "emergencyForm"
  )
  .addEventListener(

    "submit",

    async function (event) {

      event.preventDefault();


      if (!currentUser) {

        alert(
          "Please login first."
        );

        return;

      }


      const name =
        document.getElementById(
          "name"
        ).value.trim();


      const emergencyType =
        document.getElementById(
          "emergencyType"
        ).value;


      const description =
        document.getElementById(
          "description"
        ).value.trim();


      if (
        !name ||
        !emergencyType ||
        !description
      ) {

        alert(
          "Please fill all required fields."
        );

        return;

      }


      try {

        await addDoc(

          collection(
            db,
            "reports"
          ),

          {

            name:
              name,

            emergencyType:
              emergencyType,

            description:
              description,

            location:
              currentLocation,

            userId:
              currentUser.uid,

            userEmail:
              currentUser.email,

            status:
              "Pending",

            createdAt:
              serverTimestamp()

          }

        );


        alert(
          "Emergency report submitted successfully! 🚨"
        );


        document
          .getElementById(
            "emergencyForm"
          )
          .reset();


        currentLocation =
          null;


        document.getElementById(
          "locationStatus"
        ).textContent =
          "";


        closeReportForm();


      } catch (error) {

        console.error(error);

        alert(
          "Unable to submit report: " +
          error.message
        );

      }

    }

  );


// ==========================================
// FEEDBACK SYSTEM
// ==========================================

window.submitFeedback =
async function () {

  if (!currentUser) {

    alert(
      "Please login first to submit feedback."
    );

    openLoginModal();

    return;

  }


  const feedbackInput =
    document.getElementById(
      "feedbackMessage"
    );


  if (!feedbackInput) {

    console.error(
      "Feedback input not found."
    );

    return;

  }


  const feedback =
    feedbackInput.value.trim();


  if (!feedback) {

    alert(
      "Please write your feedback first."
    );

    return;

  }


  try {

    await addDoc(

      collection(
        db,
        "feedback"
      ),

      {

        message:
          feedback,

        userId:
          currentUser.uid,

        userEmail:
          currentUser.email,

        userName:
          currentUser.displayName ||
          currentUser.email.split("@")[0],

        createdAt:
          serverTimestamp()

      }

    );


    feedbackInput.value = "";


    alert(
      "Thank you for your feedback! ❤️"
    );


  } catch (error) {

    console.error(error);

    alert(
      "Unable to submit feedback."
    );

  }

};


// ==========================================
// LOAD FEEDBACK
// ADMIN ONLY
// ==========================================

function loadFeedback() {

  if (!isAdmin) return;


  if (unsubscribeFeedback) {

    unsubscribeFeedback();

  }


  unsubscribeFeedback =
    onSnapshot(

      collection(
        db,
        "feedback"
      ),

      (snapshot) => {

        feedbackList = [];


        snapshot.forEach(
          (documentSnapshot) => {

            feedbackList.push({

              id:
                documentSnapshot.id,

              ...documentSnapshot.data()

            });

          }
        );


        feedbackList.sort(
          (a, b) => {

            const timeA =
              a.createdAt?.seconds || 0;

            const timeB =
              b.createdAt?.seconds || 0;

            return timeB - timeA;

          }
        );


        renderFeedback();

      },


      (error) => {

        console.error(
          "Feedback loading error:",
          error
        );

      }

    );

}


// ==========================================
// RENDER FEEDBACK
// ADMIN ONLY
// ==========================================

function renderFeedback() {

  const feedbackContainer =
    document.getElementById(
      "feedbackContainer"
    );


  if (!feedbackContainer) return;


  if (!isAdmin) {

    feedbackContainer.innerHTML = "";

    return;

  }


  if (
    feedbackList.length === 0
  ) {

    feedbackContainer.innerHTML = `
      <p class="no-report">
        No feedback received yet.
      </p>
    `;

    return;

  }


  feedbackContainer.innerHTML = "";


  feedbackList.forEach(
    (feedback) => {

      let dateText =
        "Just now";


      if (feedback.createdAt) {

        dateText =
          feedback.createdAt
            .toDate()
            .toLocaleString();

      }


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "report-card";


      card.innerHTML = `

        <div class="report-top">

          <h3>
            💬 User Feedback
          </h3>

          <button
            class="delete-btn"
            onclick="deleteFeedback(
              '${feedback.id}'
            )"
          >
            🗑 Delete
          </button>

        </div>


        <p>
          <strong>Name:</strong>
          ${escapeHTML(
            feedback.userName ||
            "Unknown"
          )}
        </p>


        <p>
          <strong>Email:</strong>
          ${escapeHTML(
            feedback.userEmail ||
            "Unknown"
          )}
        </p>


        <p>
          <strong>Feedback:</strong>
          ${escapeHTML(
            feedback.message
          )}
        </p>


        <p>
          <strong>Submitted:</strong>
          ${dateText}
        </p>

      `;


      feedbackContainer.appendChild(
        card
      );

    }

  );

}


// ==========================================
// DELETE FEEDBACK
// ADMIN ONLY
// ==========================================

window.deleteFeedback =
async function (
  feedbackId
) {

  if (!isAdmin) {

    alert(
      "Admin access required."
    );

    return;

  }


  const confirmDelete =
    confirm(
      "Delete this feedback?"
    );


  if (!confirmDelete) return;


  try {

    await deleteDoc(

      doc(
        db,
        "feedback",
        feedbackId
      )

    );


  } catch (error) {

    console.error(error);

    alert(
      "Unable to delete feedback."
    );

  }

};


// ==========================================
// LOGIN MODAL
// ==========================================

window.openLoginModal =
function () {

  document.getElementById(
    "loginModal"
  ).style.display =
    "block";

};


window.closeLoginModal =
function () {

  document.getElementById(
    "loginModal"
  ).style.display =
    "none";

};


// ==========================================
// SIGNUP MODAL
// ==========================================

window.openSignupModal =
function () {

  document.getElementById(
    "signupModal"
  ).style.display =
    "block";

};


window.closeSignupModal =
function () {

  document.getElementById(
    "signupModal"
  ).style.display =
    "none";

};


// ==========================================
// CLOSE MODAL WHEN CLICK OUTSIDE
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


    if (
      event.target === reportModal
    ) {

      closeReportForm();

    }


    if (
      event.target === loginModal
    ) {

      closeLoginModal();

    }


    if (
      event.target === signupModal
    ) {

      closeSignupModal();

    }

  }

);


// ==========================================
// ESCAPE HTML
// SECURITY
// ==========================================

function escapeHTML(value) {

  if (!value) return "";


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ==========================================
// FINAL
// ==========================================

console.log(
  "🚨 NOVA Disaster Response Loaded Successfully"
);
