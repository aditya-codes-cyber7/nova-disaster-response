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


// ==========================================
// DOM ELEMENTS
// ==========================================

const authButtons = document.getElementById("authButtons");
const userProfile = document.getElementById("userProfile");
const userName = document.getElementById("userName");
const reportsContainer = document.getElementById("reportsContainer");
const reportCount = document.getElementById("reportCount");
const totalReports = document.getElementById("totalReports");
const activeReports = document.getElementById("activeReports");
const resolvedReports = document.getElementById("resolvedReports");
const clearButton = document.querySelector(".clear-btn");


// ==========================================
// AUTH STATE LISTENER
// ==========================================

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (user) {

    isAdmin =
      user.email &&
      user.email.toLowerCase() ===
      ADMIN_EMAIL.toLowerCase();


    if (authButtons) authButtons.style.display = "none";
    if (userProfile) userProfile.style.display = "flex";


    const displayName =
      user.displayName ||
      user.email.split("@")[0];


    if (userName) {

      if (isAdmin) {
        userName.textContent = `${displayName} 🛡️ ADMIN`;
      } else {
        userName.textContent = `${displayName} 👤`;
      }

    }


    if (clearButton) {
      clearButton.style.display =
        isAdmin ? "block" : "none";
    }


    loadReports();

  } else {

    currentUser = null;
    isAdmin = false;
    userReports = [];


    if (authButtons) authButtons.style.display = "flex";
    if (userProfile) userProfile.style.display = "none";
    if (clearButton) clearButton.style.display = "none";


    if (unsubscribeReports) {
      unsubscribeReports();
      unsubscribeReports = null;
    }


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
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;


  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }


  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
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


    alert("Account created successfully! 🎉");

    closeSignupModal();

  } catch (error) {

    alert(error.message);

  }

};


// ==========================================
// LOGIN
// ==========================================

window.loginUser = async function () {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    alert("Login successful! 🚀");

    closeLoginModal();

  } catch (error) {

    alert("Login failed: " + error.message);

  }

};


// ==========================================
// GOOGLE LOGIN
// ==========================================

window.googleLogin = async function () {

  try {

    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);

    closeLoginModal();
    closeSignupModal();

  } catch (error) {

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

    alert("Logged out successfully.");

  } catch (error) {

    alert(error.message);

  }

};


// ==========================================
// LOAD REPORTS
// ==========================================

function loadReports() {

  if (!currentUser) return;


  if (unsubscribeReports) {
    unsubscribeReports();
  }


  let reportsQuery;


  // ADMIN SEES ALL REPORTS
  if (isAdmin) {

    reportsQuery =
      query(
        collection(db, "reports")
      );

  }

  // NORMAL USER SEES OWN REPORTS
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


  unsubscribeReports =
    onSnapshot(

      reportsQuery,

      (snapshot) => {

        userReports = [];


        snapshot.forEach((documentSnapshot) => {

          userReports.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
          });

        });


        // SORT NEWEST FIRST
        userReports.sort((a, b) => {

          const timeA =
            a.createdAt?.seconds || 0;

          const timeB =
            b.createdAt?.seconds || 0;

          return timeB - timeA;

        });


        renderReports();
        updateDashboard(userReports);

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

  if (!currentUser || !reportsContainer) return;


  const filterElement =
    document.getElementById("reportFilter");


  const filter =
    filterElement ? filterElement.value : "All";


  let filteredReports = userReports;


  if (filter !== "All") {

    filteredReports =
      userReports.filter(
        report =>
          report.emergencyType === filter
      );

  }


  if (filteredReports.length === 0) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        No emergency reports found.
      </p>
    `;

    return;

  }


  reportsContainer.innerHTML = "";


  filteredReports.forEach((report) => {

    const card =
      document.createElement("div");


    card.className = "report-card";


    // DATE
    let dateText = "Just now";

    if (report.createdAt) {

      try {

        const date =
          report.createdAt.toDate();

        dateText =
          date.toLocaleString();

      } catch (error) {
        dateText = "Recently";
      }

    }


    // LOCATION
    let locationText = "Not shared";

    if (
      report.location &&
      typeof report.location.latitude === "number"
    ) {

      locationText =
        `${report.location.latitude.toFixed(4)},
         ${report.location.longitude.toFixed(4)}`;

    }


    const status =
      report.status || "Pending";


    const statusClass =
      status === "Resolved"
        ? "resolved-status"
        : "pending-status";


    // =====================================
    // ADMIN VIEW
    // =====================================

    if (isAdmin) {

      card.innerHTML = `

        <div class="report-top">

          <h3>
            ${escapeHTML(report.emergencyType)}
          </h3>

          <span class="status-badge ${statusClass}">
            ${escapeHTML(status)}
          </span>

        </div>


        <p>
          <strong>Name:</strong>
          ${escapeHTML(report.name)}
        </p>


        <p>
          <strong>User Email:</strong>
          ${escapeHTML(report.userEmail || "Unknown")}
        </p>


        <p>
          <strong>Description:</strong>
          ${escapeHTML(report.description)}
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
            class="resolve-btn"
            onclick="changeReportStatus('${report.id}', 'Resolved')"
          >
            ✅ Resolve
          </button>


          <button
            class="active-btn"
            onclick="changeReportStatus('${report.id}', 'Pending')"
          >
            ⏳ Pending
          </button>


          <button
            class="delete-btn"
            onclick="deleteReport('${report.id}')"
          >
            🗑 Delete
          </button>

        </div>

      `;

    }


    // =====================================
    // NORMAL USER VIEW
    // =====================================

    else {

      const userStatusText =
        status === "Resolved"
          ? "✅ Your case has been resolved."
          : "⏳ Your case is pending and under review.";


      const userStatusClass =
        status === "Resolved"
          ? "resolved"
          : "pending";


      card.innerHTML = `

        <div class="report-top">

          <h3>
            ${escapeHTML(report.emergencyType)}
          </h3>

          <span class="status-badge ${statusClass}">
            ${escapeHTML(status)}
          </span>

        </div>


        <p>
          <strong>Name:</strong>
          ${escapeHTML(report.name)}
        </p>


        <p>
          <strong>Description:</strong>
          ${escapeHTML(report.description)}
        </p>


        <p>
          <strong>Location:</strong>
          ${locationText}
        </p>


        <p>
          <strong>Submitted:</strong>
          ${dateText}
        </p>


        <div class="case-status ${userStatusClass}">
          ${userStatusText}
        </div>

      `;

    }


    reportsContainer.appendChild(card);

  });

}


// ==========================================
// FILTER REPORTS
// ==========================================

window.filterReports = function () {
  renderReports();
};


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard(reports) {

  const total = reports.length;

  let active = 0;
  let resolved = 0;


  reports.forEach((report) => {

    if (report.status === "Resolved") {
      resolved++;
    } else {
      active++;
    }

  });


  if (reportCount)
    reportCount.textContent = total;

  if (totalReports)
    totalReports.textContent = total;


  if (activeReports)
    activeReports.textContent = active;

  if (resolvedReports)
    resolvedReports.textContent = resolved;

}


// ==========================================
// CHANGE REPORT STATUS
// ==========================================

window.changeReportStatus =
async function (reportId, newStatus) {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }


  try {

    await updateDoc(
      doc(db, "reports", reportId),
      {
        status: newStatus
      }
    );


    alert(
      `Report marked as ${newStatus}.`
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
// ==========================================

window.deleteReport =
async function (reportId) {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }


  const confirmDelete =
    confirm(
      "Delete this report permanently?"
    );


  if (!confirmDelete) return;


  try {

    await deleteDoc(
      doc(db, "reports", reportId)
    );


    alert("Report deleted.");

  } catch (error) {

    console.error(error);

    alert("Unable to delete report.");

  }

};


// ==========================================
// CLEAR ALL REPORTS
// ==========================================

window.clearAllReports =
async function () {

  if (!isAdmin) {
    alert("Admin access required.");
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
        collection(db, "reports")
      );


    const deletePromises = [];


    snapshot.forEach((documentSnapshot) => {

      deletePromises.push(

        deleteDoc(
          doc(
            db,
            "reports",
            documentSnapshot.id
          )
        )

      );

    });


    await Promise.all(deletePromises);


    alert("All reports deleted.");

  } catch (error) {

    console.error(error);

    alert("Unable to clear reports.");

  }

};


// ==========================================
// OPEN REPORT FORM
// ==========================================

window.openReportForm = function () {

  if (!currentUser) {

    alert(
      "Please login first to submit an emergency report."
    );

    openLoginModal();

    return;

  }


  const modal =
    document.getElementById("reportModal");


  if (modal)
    modal.style.display = "block";


  const nameInput =
    document.getElementById("name");


  if (
    currentUser.displayName &&
    nameInput &&
    !nameInput.value
  ) {

    nameInput.value =
      currentUser.displayName;

  }

};


// SOS
window.openSOSForm = function () {
  openReportForm();
};


// ==========================================
// CLOSE REPORT FORM
// ==========================================

window.closeReportForm = function () {

  const modal =
    document.getElementById("reportModal");

  if (modal)
    modal.style.display = "none";

};


// ==========================================
// LOCATION
// ==========================================

window.getLocation = function () {

  const status =
    document.getElementById("locationStatus");


  if (!navigator.geolocation) {

    if (status)
      status.textContent =
        "Geolocation is not supported.";

    return;

  }


  if (status)
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


      if (status)
        status.textContent =
          "📍 Location added successfully.";

    },


    (error) => {

      console.error(error);

      if (status)
        status.textContent =
          "Unable to get location.";

    }

  );

};


// ==========================================
// SUBMIT EMERGENCY REPORT
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

        return;

      }


      const name =
        document.getElementById("name").value.trim();

      const emergencyType =
        document.getElementById("emergencyType").value;

      const description =
        document.getElementById("description").value.trim();


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
          collection(db, "reports"),

          {

            name: name,

            emergencyType: emergencyType,

            description: description,

            location: currentLocation,

            userId: currentUser.uid,

            userEmail: currentUser.email,

            status: "Pending",

            createdAt: serverTimestamp()

          }

        );


        alert(
          "Emergency report submitted successfully! 🚨"
        );


        emergencyForm.reset();


        currentLocation = null;


        const locationStatus =
          document.getElementById(
            "locationStatus"
          );


        if (locationStatus)
          locationStatus.textContent = "";


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

}


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


  const feedbackType =
    document.getElementById("feedbackType");

  const feedbackMessage =
    document.getElementById("feedbackMessage");


  if (!feedbackType || !feedbackMessage) {
    return;
  }


  const type =
    feedbackType.value;

  const message =
    feedbackMessage.value.trim();


  if (!message) {

    alert(
      "Please write your feedback."
    );

    return;

  }


  try {

    await addDoc(
      collection(db, "feedback"),

      {

        userId: currentUser.uid,

        userEmail: currentUser.email,

        userName:
          currentUser.displayName ||
          "Anonymous",

        feedbackType: type,

        message: message,

        createdAt: serverTimestamp()

      }

    );


    alert(
      "Thank you for your feedback! 💙"
    );


    feedbackMessage.value = "";


    if (feedbackType)
      feedbackType.value = "General";

  } catch (error) {

    console.error(error);

    alert(
      "Unable to submit feedback."
    );

  }

};


// ==========================================
// LOGIN MODAL
// ==========================================

window.openLoginModal = function () {

  const modal =
    document.getElementById("loginModal");

  if (modal)
    modal.style.display = "block";

};


window.closeLoginModal = function () {

  const modal =
    document.getElementById("loginModal");

  if (modal)
    modal.style.display = "none";

};


// ==========================================
// SIGNUP MODAL
// ==========================================

window.openSignupModal = function () {

  const modal =
    document.getElementById("signupModal");

  if (modal)
    modal.style.display = "block";

};


window.closeSignupModal = function () {

  const modal =
    document.getElementById("signupModal");

  if (modal)
    modal.style.display = "none";

};


// ==========================================
// CLOSE MODALS OUTSIDE CLICK
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
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  if (!value) return "";


  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ==========================================
// FINAL
// ==========================================

console.log(
  "🚨 NOVA Disaster Response Loaded Successfully"
);
