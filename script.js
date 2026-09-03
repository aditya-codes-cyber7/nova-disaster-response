/* ==========================================
   NOVA DISASTER RESPONSE
   FINAL SCRIPT.JS - PHASE 6
========================================== */


/* ==========================================
   FIREBASE IMPORTS
========================================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBcEkoZMt1KZdQ-ch6J1-7KKyQRO542ZRY",
  authDomain: "nova-disaster-response.firebaseapp.com",
  projectId: "nova-disaster-response",
  storageBucket: "nova-disaster-response.firebasestorage.app",
  messagingSenderId: "275029316991",
  appId: "1:275029316991:web:382543b5ef90263b8364a"
};


/* ==========================================
   INITIALIZE FIREBASE
========================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentUser = null;

let currentLocation = null;

let allReports = [];

let selectedImageBase64 = null;


/* ==========================================
   ADMIN EMAIL
========================================== */

/*
  CHANGE THIS TO YOUR EMAIL

  Example:
  const ADMIN_EMAIL = "your@email.com";
*/

const ADMIN_EMAIL = "adi56tya65raj00@gmail.com";


/* ==========================================
   LANGUAGE SUPPORT
========================================== */

const translations = {

  en: {
    home: "Home",
    features: "Features",
    emergency: "Emergency",
    dashboard: "Dashboard",
    reports: "Reports",
    feedback: "Feedback"
  },

  hi: {
    home: "होम",
    features: "फीचर्स",
    emergency: "आपातकाल",
    dashboard: "डैशबोर्ड",
    reports: "रिपोर्ट्स",
    feedback: "फीडबैक"
  }

};


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(auth, async (user) => {

  currentUser = user;

  const authButtons =
    document.getElementById("authButtons");

  const userProfile =
    document.getElementById("userProfile");

  const userName =
    document.getElementById("userName");


  if (user) {

    authButtons.style.display = "none";

    userProfile.style.display = "flex";

    userName.textContent =
      `👋 ${user.displayName || user.email.split("@")[0]}`;


    await loadReports();

    checkAdmin(user);

  }

  else {

    authButtons.style.display = "flex";

    userProfile.style.display = "none";

    document.getElementById(
      "reportsContainer"
    ).innerHTML = `
      <p class="no-report">
        🔐 Login to view emergency reports.
      </p>
    `;

    resetAnalytics();

  }

});


/* ==========================================
   CHECK ADMIN
========================================== */

function checkAdmin(user) {

  const adminSection =
    document.getElementById(
      "adminFeedbackSection"
    );


  if (
    ADMIN_EMAIL !== "YOUR_ADMIN_EMAIL_HERE" &&
    user.email === ADMIN_EMAIL
  ) {

    adminSection.style.display = "block";

    loadFeedback();

  }

  else {

    adminSection.style.display = "none";

  }

}


/* ==========================================
   SIGNUP
========================================== */

window.signupUser = async function () {

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


  if (!name || !email || !password) {

    alert(
      "Please fill all fields."
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


    await updateProfile(
      userCredential.user,
      {
        displayName: name
      }
    );


    alert(
      "🎉 Account created successfully!"
    );


    closeSignupModal();


  }

  catch (error) {

    console.error(error);

    alert(
      error.message
    );

  }

};


/* ==========================================
   LOGIN
========================================== */

window.loginUser = async function () {

  const email =
    document.getElementById(
      "loginEmail"
    ).value.trim();

  const password =
    document.getElementById(
      "loginPassword"
    ).value;


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
      "Welcome back! 👋"
    );


    closeLoginModal();


  }

  catch (error) {

    console.error(error);

    alert(
      "Login failed: " +
      error.message
    );

  }

};


/* ==========================================
   GOOGLE LOGIN
========================================== */

window.googleLogin = async function () {

  try {

    await signInWithPopup(
      auth,
      provider
    );


    closeLoginModal();

    closeSignupModal();


    alert(
      "Google login successful! 🎉"
    );

  }

  catch (error) {

    console.error(error);

    alert(
      error.message
    );

  }

};


/* ==========================================
   LOGOUT
========================================== */

window.logoutUser = async function () {

  try {

    await signOut(auth);

    alert(
      "Logged out successfully."
    );

  }

  catch (error) {

    console.error(error);

  }

};


/* ==========================================
   MODAL FUNCTIONS
========================================== */

window.openLoginModal = function () {

  document.getElementById(
    "loginModal"
  ).style.display = "block";

};


window.closeLoginModal = function () {

  document.getElementById(
    "loginModal"
  ).style.display = "none";

};


window.openSignupModal = function () {

  document.getElementById(
    "signupModal"
  ).style.display = "block";

};


window.closeSignupModal = function () {

  document.getElementById(
    "signupModal"
  ).style.display = "none";

};


window.openReportForm = function () {

  if (!currentUser) {

    alert(
      "🔐 Please login first to report an emergency."
    );

    openLoginModal();

    return;

  }


  document.getElementById(
    "reportModal"
  ).style.display = "block";

};


window.openSOSForm = function () {

  openReportForm();

};


window.closeReportForm = function () {

  document.getElementById(
    "reportModal"
  ).style.display = "none";

};


/* ==========================================
   CLOSE MODAL OUTSIDE
========================================== */

window.onclick = function (event) {

  const modals =
    document.querySelectorAll(".modal");


  modals.forEach((modal) => {

    if (event.target === modal) {

      modal.style.display = "none";

    }

  });

};


/* ==========================================
   LOCATION
========================================== */

window.getLocation = function () {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (!navigator.geolocation) {

    status.textContent =
      "❌ Location is not supported.";

    return;

  }


  status.textContent =
    "📍 Getting your location...";


  navigator.geolocation.getCurrentPosition(

    (position) => {

      currentLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      };


      status.innerHTML = `
        ✅ Location captured successfully
        <br>
        Lat: ${currentLocation.latitude.toFixed(5)}
        |
        Long: ${currentLocation.longitude.toFixed(5)}
      `;

    },


    (error) => {

      console.error(error);

      status.textContent =
        "❌ Unable to get location. Please allow location permission.";

    },

    {
      enableHighAccuracy: true,
      timeout: 10000
    }

  );

};


/* ==========================================
   IMAGE UPLOAD
========================================== */

const reportImageInput =
  document.getElementById("reportImage");


if (reportImageInput) {

  reportImageInput.addEventListener(
    "change",
    function () {

      const file =
        this.files[0];


      if (!file) return;


      if (
        !file.type.startsWith("image/")
      ) {

        alert(
          "Please select an image file."
        );

        return;

      }


      if (
        file.size > 2 * 1024 * 1024
      ) {

        alert(
          "Image size must be less than 2MB."
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload = function (event) {

        selectedImageBase64 =
          event.target.result;


        const preview =
          document.getElementById(
            "imagePreview"
          );


        if (preview) {

          preview.src =
            selectedImageBase64;

          preview.style.display =
            "block";

        }

      };


      reader.readAsDataURL(file);

    }
  );

}


/* ==========================================
   SUBMIT EMERGENCY REPORT
========================================== */

const emergencyForm =
  document.getElementById(
    "emergencyForm"
  );


if (emergencyForm) {

  emergencyForm.addEventListener(
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

      const priority =
        document.getElementById(
          "priority"
        ).value;

      const description =
        document.getElementById(
          "description"
        ).value.trim();


      if (
        !name ||
        !emergencyType ||
        !priority ||
        !description
      ) {

        alert(
          "Please fill all required fields."
        );

        return;

      }


      try {

        const reportData = {

          userId:
            currentUser.uid,

          userEmail:
            currentUser.email,

          name:
            name,

          emergencyType:
            emergencyType,

          priority:
            priority,

          description:
            description,

          status:
            "Pending",

          location:
            currentLocation || null,

          image:
            selectedImageBase64 || null,

          createdAt:
            serverTimestamp()

        };


        await addDoc(
          collection(
            db,
            "reports"
          ),
          reportData
        );


        alert(
          "🚨 Emergency report submitted successfully!"
        );


        emergencyForm.reset();

        currentLocation = null;

        selectedImageBase64 = null;


        const status =
          document.getElementById(
            "locationStatus"
          );

        if (status) {

          status.textContent = "";

        }


        const preview =
          document.getElementById(
            "imagePreview"
          );

        if (preview) {

          preview.style.display =
            "none";

        }


        closeReportForm();

        await loadReports();

      }

      catch (error) {

        console.error(error);

        alert(
          "Error submitting report: " +
          error.message
        );

      }

    }
  );

}


/* ==========================================
   LOAD REPORTS
========================================== */

async function loadReports() {

  if (!currentUser) return;


  try {

    const reportsRef =
      collection(
        db,
        "reports"
      );


    const snapshot =
      await getDocs(
        reportsRef
      );


    allReports = [];


    snapshot.forEach((docItem) => {

      const data =
        docItem.data();


      /*
        Admin can see all reports.
        Normal user sees only own reports.
      */

      const isAdmin =
        currentUser.email ===
        ADMIN_EMAIL;


      if (
        isAdmin ||
        data.userId === currentUser.uid
      ) {

        allReports.push({

          id:
            docItem.id,

          ...data

        });

      }

    });


    allReports.sort(
      (a, b) => {

        const timeA =
          a.createdAt?.seconds || 0;

        const timeB =
          b.createdAt?.seconds || 0;

        return timeB - timeA;

      }
    );


    displayReports(
      allReports
    );


    updateAnalytics(
      allReports
    );


  }

  catch (error) {

    console.error(
      "Error loading reports:",
      error
    );

  }

}


/* ==========================================
   DISPLAY REPORTS
========================================== */

function displayReports(reports) {

  const container =
    document.getElementById(
      "reportsContainer"
    );


  const reportCount =
    document.getElementById(
      "reportCount"
    );


  reportCount.textContent =
    reports.length;


  if (reports.length === 0) {

    container.innerHTML = `
      <p class="no-report">
        📭 No emergency reports found.
      </p>
    `;

    return;

  }


  container.innerHTML = "";


  reports.forEach((report) => {

    let date = "Recently";


    if (report.createdAt?.seconds) {

      date =
        new Date(
          report.createdAt.seconds * 1000
        ).toLocaleString();

    }


    const statusClass =
      getStatusClass(
        report.status
      );


    const priorityClass =
      getPriorityClass(
        report.priority
      );


    const isAdmin =
      currentUser.email ===
      ADMIN_EMAIL;


    const imageHTML =
      report.image
        ? `
          <img
            src="${report.image}"
            class="report-image"
            alt="Emergency Evidence"
          >
        `
        : "";


    const locationHTML =
      report.location
        ? `
          <p>
            📍 Location:
            <a
              href="https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}"
              target="_blank"
              style="color:#7fa8ff;"
            >
              View on Map
            </a>
          </p>
        `
        : `
          <p>
            📍 Location:
            Not shared
          </p>
        `;


    let adminButtons = "";


    if (isAdmin) {

      adminButtons = `

        <div class="report-actions">

          <button
            class="active-btn"
            onclick="updateReportStatus('${report.id}', 'In Progress')"
          >
            🔵 In Progress
          </button>


          <button
            class="resolve-btn"
            onclick="updateReportStatus('${report.id}', 'Resolved')"
          >
            ✅ Resolve
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


    container.innerHTML += `

      <div class="report-card">

        <div class="report-top">

          <h3>
            🚨 ${escapeHTML(report.emergencyType)}
          </h3>

          <span class="status-badge ${statusClass}">
            ${escapeHTML(report.status)}
          </span>

        </div>


        <p>
          👤 <strong>Name:</strong>
          ${escapeHTML(report.name)}
        </p>


        <p>
          ⚡ <strong>Priority:</strong>
          <span class="${priorityClass}">
            ${escapeHTML(report.priority)}
          </span>
        </p>


        <p>
          📝 <strong>Description:</strong>
          ${escapeHTML(report.description)}
        </p>


        ${locationHTML}


        ${imageHTML}


        <p>
          🕒 <strong>Reported:</strong>
          ${date}
        </p>


        ${adminButtons}

      </div>

    `;

  });

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(text) {

  if (!text) return "";

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* ==========================================
   STATUS CLASS
========================================== */

function getStatusClass(status) {

  if (status === "Resolved") {

    return "resolved-status";

  }


  if (status === "In Progress") {

    return "active-status";

  }


  return "pending-status";

}


/* ==========================================
   PRIORITY CLASS
========================================== */

function getPriorityClass(priority) {

  const priorityMap = {

    Critical:
      "priority-critical",

    High:
      "priority-high",

    Medium:
      "priority-medium",

    Low:
      "priority-low"

  };


  return priorityMap[priority] || "";

}


/* ==========================================
   UPDATE REPORT STATUS
========================================== */

window.updateReportStatus =
  async function (
    reportId,
    newStatus
  ) {

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


      await loadReports();

    }

    catch (error) {

      console.error(error);

      alert(
        "Unable to update report."
      );

    }

  };


/* ==========================================
   DELETE REPORT
========================================== */

window.deleteReport =
  async function (
    reportId
  ) {

    const confirmDelete =
      confirm(
        "Are you sure you want to delete this report?"
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


      alert(
        "Report deleted successfully."
      );


      await loadReports();

    }

    catch (error) {

      console.error(error);

      alert(
        "Unable to delete report."
      );

    }

  };


/* ==========================================
   CLEAR ALL REPORTS
========================================== */

window.clearAllReports =
  async function () {

    if (
      currentUser.email !==
      ADMIN_EMAIL
    ) {

      return;

    }


    const confirmation =
      confirm(
        "Delete ALL emergency reports?"
      );


    if (!confirmation) return;


    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "reports"
          )
        );


      for (
        const documentItem
        of snapshot.docs
      ) {

        await deleteDoc(
          doc(
            db,
            "reports",
            documentItem.id
          )
        );

      }


      await loadReports();


      alert(
        "All reports cleared."
      );

    }

    catch (error) {

      console.error(error);

    }

  };


/* ==========================================
   FILTER REPORTS
========================================== */

window.filterReports =
  function () {

    const type =
      document.getElementById(
        "reportFilter"
      ).value;

    const status =
      document.getElementById(
        "statusFilter"
      ).value;

    const priority =
      document.getElementById(
        "priorityFilter"
      ).value;

    const search =
      document.getElementById(
        "reportSearch"
      ).value
        .toLowerCase()
        .trim();


    const filtered =
      allReports.filter(
        (report) => {


          const matchType =
            type === "All" ||
            report.emergencyType === type;


          const matchStatus =
            status === "All" ||
            report.status === status;


          const matchPriority =
            priority === "All" ||
            report.priority === priority;


          const searchText =
            `
              ${report.name || ""}
              ${report.userEmail || ""}
              ${report.emergencyType || ""}
              ${report.description || ""}
            `
              .toLowerCase();


          const matchSearch =
            searchText.includes(
              search
            );


          return (
            matchType &&
            matchStatus &&
            matchPriority &&
            matchSearch
          );

        }
      );


    displayReports(
      filtered
    );

  };


/* ==========================================
   ANALYTICS
========================================== */

function updateAnalytics(reports) {

  const total =
    reports.length;


  const pending =
    reports.filter(
      report =>
        report.status === "Pending"
    ).length;


  const progress =
    reports.filter(
      report =>
        report.status === "In Progress"
    ).length;


  const resolved =
    reports.filter(
      report =>
        report.status === "Resolved"
    ).length;


  /* HERO */

  setText(
    "totalReports",
    total
  );

  setText(
    "activeReports",
    pending + progress
  );

  setText(
    "resolvedReports",
    resolved
  );


  /* ANALYTICS */

  setText(
    "analyticsTotal",
    total
  );

  setText(
    "pendingReports",
    pending
  );

  setText(
    "progressReports",
    progress
  );

  setText(
    "analyticsResolved",
    resolved
  );


  /* PRIORITY */

  const critical =
    reports.filter(
      r => r.priority === "Critical"
    ).length;

  const high =
    reports.filter(
      r => r.priority === "High"
    ).length;

  const medium =
    reports.filter(
      r => r.priority === "Medium"
    ).length;

  const low =
    reports.filter(
      r => r.priority === "Low"
    ).length;


  setText(
    "criticalCount",
    critical
  );

  setText(
    "highCount",
    high
  );

  setText(
    "mediumCount",
    medium
  );

  setText(
    "lowCount",
    low
  );


  updateEmergencyTypes(
    reports
  );

}


/* ==========================================
   EMERGENCY TYPE ANALYTICS
========================================== */

function updateEmergencyTypes(reports) {

  const container =
    document.getElementById(
      "emergencyTypeStats"
    );


  if (!container) return;


  if (reports.length === 0) {

    container.innerHTML =
      "No report data available.";

    return;

  }


  const types = {};


  reports.forEach(
    (report) => {

      const type =
        report.emergencyType ||
        "Other";


      types[type] =
        (types[type] || 0) + 1;

    }
  );


  container.innerHTML = "";


  Object.keys(types).forEach(
    (type) => {

      container.innerHTML += `

        <div class="type-stat-item">

          <span>
            ${escapeHTML(type)}
          </span>

          <strong>
            ${types[type]}
          </strong>

        </div>

      `;

    }
  );

}


/* ==========================================
   SET TEXT SAFELY
========================================== */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


/* ==========================================
   RESET ANALYTICS
========================================== */

function resetAnalytics() {

  const ids = [

    "totalReports",
    "activeReports",
    "resolvedReports",

    "analyticsTotal",
    "pendingReports",
    "progressReports",
    "analyticsResolved",

    "criticalCount",
    "highCount",
    "mediumCount",
    "lowCount"

  ];


  ids.forEach(
    id => setText(id, 0)
  );


  const typeStats =
    document.getElementById(
      "emergencyTypeStats"
    );


  if (typeStats) {

    typeStats.textContent =
      "No report data available.";

  }

}


/* ==========================================
   FEEDBACK
========================================== */

const feedbackForm =
  document.getElementById(
    "feedbackForm"
  );


if (feedbackForm) {

  feedbackForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const name =
        document.getElementById(
          "feedbackName"
        ).value.trim();

      const rating =
        document.getElementById(
          "feedbackRating"
        ).value;

      const message =
        document.getElementById(
          "feedbackMessage"
        ).value.trim();


      if (
        !name ||
        !rating ||
        !message
      ) {

        alert(
          "Please fill all fields."
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

            name,

            rating,

            message,

            userEmail:
              currentUser
                ? currentUser.email
                : "Anonymous",

            createdAt:
              serverTimestamp()

          }

        );


        alert(
          "Thank you for your feedback! 💙"
        );


        feedbackForm.reset();


        if (
          currentUser &&
          currentUser.email ===
          ADMIN_EMAIL
        ) {

          loadFeedback();

        }

      }

      catch (error) {

        console.error(error);

        alert(
          "Unable to submit feedback."
        );

      }

    }
  );

}


/* ==========================================
   LOAD FEEDBACK (ADMIN)
========================================== */

async function loadFeedback() {

  if (
    !currentUser ||
    currentUser.email !==
    ADMIN_EMAIL
  ) {

    return;

  }


  const list =
    document.getElementById(
      "feedbackList"
    );


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "feedback"
        )
      );


    const feedbackData = [];


    snapshot.forEach(
      item => {

        feedbackData.push({

          id:
            item.id,

          ...item.data()

        });

      }
    );


    feedbackData.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;

      }
    );


    if (
      feedbackData.length === 0
    ) {

      list.innerHTML = `
        <p class="no-report">
          No feedback available.
        </p>
      `;

      return;

    }


    list.innerHTML = "";


    feedbackData.forEach(
      feedback => {

        const stars =
          "⭐".repeat(
            Number(
              feedback.rating
            )
          );


        list.innerHTML += `

          <div class="feedback-item">

            <h4>
              👤 ${escapeHTML(feedback.name)}
            </h4>

            <div class="feedback-rating">
              ${stars}
            </div>

            <p>
              ${escapeHTML(feedback.message)}
            </p>

          </div>

        `;

      }
    );

  }

  catch (error) {

    console.error(error);

  }

}


/* ==========================================
   PAGE LOADED
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "🚨 NOVA Disaster Response System Ready"
    );

  }
);
