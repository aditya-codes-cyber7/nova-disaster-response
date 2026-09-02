// ==========================================
// NOVA DISASTER RESPONSE
// FINAL SCRIPT.JS
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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

const googleProvider = new GoogleAuthProvider();


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let userReports = [];

let currentLocation = null;


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getElement(id) {
  return document.getElementById(id);
}


function showModal(id) {
  const modal = getElement(id);

  if (modal) {
    modal.style.display = "block";
  }
}


function hideModal(id) {
  const modal = getElement(id);

  if (modal) {
    modal.style.display = "none";
  }
}


function showMessage(message) {
  alert(message);
}


// ==========================================
// MODAL FUNCTIONS
// ==========================================

window.openLoginModal = function () {

  hideModal("signupModal");

  showModal("loginModal");

};


window.closeLoginModal = function () {

  hideModal("loginModal");

};


window.openSignupModal = function () {

  hideModal("loginModal");

  showModal("signupModal");

};


window.closeSignupModal = function () {

  hideModal("signupModal");

};


window.openReportForm = function () {

  if (!currentUser) {

    showMessage("Please login first to submit an emergency report.");

    showModal("loginModal");

    return;

  }

  showModal("reportModal");

};


window.openSOSForm = function () {

  window.openReportForm();

};


window.closeReportForm = function () {

  hideModal("reportModal");

};


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click", function (event) {

  const reportModal = getElement("reportModal");

  const loginModal = getElement("loginModal");

  const signupModal = getElement("signupModal");


  if (event.target === reportModal) {
    hideModal("reportModal");
  }


  if (event.target === loginModal) {
    hideModal("loginModal");
  }


  if (event.target === signupModal) {
    hideModal("signupModal");
  }

});


// ==========================================
// SIGNUP USER
// ==========================================

window.signupUser = async function () {

  const name = getElement("signupName").value.trim();

  const email = getElement("signupEmail").value.trim();

  const password = getElement("signupPassword").value;


  if (!name) {

    showMessage("Please enter your name.");

    return;

  }


  if (!email) {

    showMessage("Please enter your email.");

    return;

  }


  if (password.length < 6) {

    showMessage("Password must be at least 6 characters.");

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


    showMessage("Account created successfully! 🎉");


    getElement("signupForm").reset();


    hideModal("signupModal");


  } catch (error) {

    console.error(error);


    if (error.code === "auth/email-already-in-use") {

      showMessage("This email is already registered.");

    } else {

      showMessage(error.message);

    }

  }

};


// ==========================================
// LOGIN USER
// ==========================================

window.loginUser = async function () {

  const email = getElement("loginEmail").value.trim();

  const password = getElement("loginPassword").value;


  if (!email || !password) {

    showMessage("Please enter email and password.");

    return;

  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    showMessage("Login successful! 👋");


    getElement("loginForm").reset();


    hideModal("loginModal");


  } catch (error) {

    console.error(error);


    showMessage(
      "Login failed. Please check your email and password."
    );

  }

};


// ==========================================
// GOOGLE LOGIN
// ==========================================

window.googleLogin = async function () {

  try {

    await signInWithPopup(
      auth,
      googleProvider
    );


    hideModal("loginModal");

    hideModal("signupModal");


    showMessage("Google login successful! 🎉");


  } catch (error) {

    console.error(error);


    if (error.code !== "auth/popup-closed-by-user") {

      showMessage("Google login failed: " + error.message);

    }

  }

};


// ==========================================
// LOGOUT USER
// ==========================================

window.logoutUser = async function () {

  try {

    await signOut(auth);


    showMessage("Logged out successfully.");


  } catch (error) {

    console.error(error);

    showMessage("Logout failed.");

  }

};


// ==========================================
// AUTH STATE LISTENER
// ==========================================

onAuthStateChanged(auth, async function (user) {

  currentUser = user;


  const authButtons = getElement("authButtons");

  const userProfile = getElement("userProfile");

  const userName = getElement("userName");


  if (user) {

    // USER LOGGED IN

    if (authButtons) {
      authButtons.style.display = "none";
    }


    if (userProfile) {
      userProfile.style.display = "flex";
    }


    if (userName) {

      const displayName =
        user.displayName ||
        user.email.split("@")[0];


      userName.textContent =
        "👤 " + displayName;

    }


    // Auto fill name in report form

    const nameInput = getElement("name");

    if (nameInput && !nameInput.value) {

      nameInput.value =
        user.displayName ||
        "";

    }


    await loadReports();


  } else {

    // USER LOGGED OUT

    if (authButtons) {
      authButtons.style.display = "flex";
    }


    if (userProfile) {
      userProfile.style.display = "none";
    }


    userReports = [];


    updateDashboard();


    const container =
      getElement("reportsContainer");


    if (container) {

      container.innerHTML = `
        <p class="no-report">
          🔐 Login to view your emergency reports.
        </p>
      `;

    }

  }

});


// ==========================================
// GET USER LOCATION
// ==========================================

window.getLocation = function () {

  const locationStatus =
    getElement("locationStatus");


  if (!navigator.geolocation) {

    locationStatus.textContent =
      "Geolocation is not supported by your browser.";

    return;

  }


  locationStatus.textContent =
    "📍 Getting your location...";


  navigator.geolocation.getCurrentPosition(

    function (position) {

      const latitude =
        position.coords.latitude.toFixed(5);

      const longitude =
        position.coords.longitude.toFixed(5);


      currentLocation =
        latitude + ", " + longitude;


      locationStatus.textContent =
        "✅ Location captured successfully.";

    },


    function (error) {

      console.error(error);


      locationStatus.textContent =
        "⚠️ Unable to get location. You can still submit the report.";

    },


    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

};


// ==========================================
// SUBMIT EMERGENCY REPORT
// ==========================================

const emergencyForm =
  getElement("emergencyForm");


if (emergencyForm) {

  emergencyForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (!currentUser) {

        showMessage(
          "Please login before submitting a report."
        );

        hideModal("reportModal");

        showModal("loginModal");

        return;

      }


      const name =
        getElement("name").value.trim();


      const emergencyType =
        getElement("emergencyType").value;


      const description =
        getElement("description").value.trim();


      if (!name || !emergencyType || !description) {

        showMessage(
          "Please fill all required fields."
        );

        return;

      }


      const submitButton =
        emergencyForm.querySelector(
          ".submit-btn"
        );


      const originalText =
        submitButton.textContent;


      try {

        submitButton.disabled = true;

        submitButton.textContent =
          "Submitting...";


        await addDoc(
          collection(db, "reports"),
          {

            userId:
              currentUser.uid,

            userEmail:
              currentUser.email,

            name:
              name,

            emergencyType:
              emergencyType,

            description:
              description,

            location:
              currentLocation || "Not provided",

            status:
              "Active",

            createdAt:
              serverTimestamp()

          }
        );


        showMessage(
          "Emergency report submitted successfully! 🚨"
        );


        emergencyForm.reset();


        currentLocation = null;


        getElement(
          "locationStatus"
        ).textContent = "";


        hideModal("reportModal");


        await loadReports();


      } catch (error) {

        console.error(error);

        showMessage(
          "Failed to submit report. Please try again."
        );


      } finally {

        submitButton.disabled = false;

        submitButton.textContent =
          originalText;

      }

    }
  );

}


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

  if (!currentUser) {

    return;

  }


  try {

    const reportsQuery =
      query(
        collection(db, "reports"),
        where(
          "userId",
          "==",
          currentUser.uid
        )
      );


    const querySnapshot =
      await getDocs(reportsQuery);


    userReports = [];


    querySnapshot.forEach(
      function (documentSnapshot) {

        const report =
          documentSnapshot.data();


        userReports.push({

          id:
            documentSnapshot.id,

          ...report

        });

      }
    );


    // Sort newest first

    userReports.sort(
      function (a, b) {

        const timeA =
          a.createdAt?.seconds || 0;

        const timeB =
          b.createdAt?.seconds || 0;


        return timeB - timeA;

      }
    );


    renderReports();

    updateDashboard();


  } catch (error) {

    console.error(
      "Error loading reports:",
      error
    );


    const container =
      getElement("reportsContainer");


    if (container) {

      container.innerHTML = `
        <p class="no-report">
          Unable to load reports.
        </p>
      `;

    }

  }

}


// ==========================================
// RENDER REPORTS
// ==========================================

function renderReports() {

  const container =
    getElement("reportsContainer");


  if (!container) {

    return;

  }


  if (!currentUser) {

    container.innerHTML = `
      <p class="no-report">
        🔐 Login to view your emergency reports.
      </p>
    `;

    return;

  }


  const selectedFilter =
    getElement("reportFilter")?.value ||
    "All";


  let filteredReports =
    userReports;


  if (selectedFilter !== "All") {

    filteredReports =
      userReports.filter(
        function (report) {

          return (
            report.emergencyType ===
            selectedFilter
          );

        }
      );

  }


  if (filteredReports.length === 0) {

    container.innerHTML = `
      <p class="no-report">
        No emergency reports found.
      </p>
    `;

    return;

  }


  container.innerHTML = "";


  filteredReports.forEach(
    function (report) {

      const reportCard =
        document.createElement("div");


      reportCard.className =
        "report-card";


      const status =
        report.status || "Active";


      const isResolved =
        status === "Resolved";


      const submittedTime =
        formatDate(
          report.createdAt
        );


      reportCard.innerHTML = `

        <div class="report-top">

          <div>

            <h3>
              ${escapeHTML(
                report.emergencyType
              )}
            </h3>

          </div>


          <span class="status-badge ${
            isResolved
              ? "resolved-status"
              : "active-status"
          }">

            ${escapeHTML(status)}

          </span>

        </div>


        <p>
          <strong>Name:</strong>
          ${escapeHTML(
            report.name || "Unknown"
          )}
        </p>


        <p>
          <strong>Problem:</strong>
          ${escapeHTML(
            report.description || "No description"
          )}
        </p>


        <p>
          <strong>Location:</strong>
          ${escapeHTML(
            report.location || "Not provided"
          )}
        </p>


        <p>
          <strong>Submitted:</strong>
          ${submittedTime}
        </p>


        <div class="report-actions">

          <button
            class="${
              isResolved
                ? "active-btn"
                : "resolve-btn"
            }"
            onclick="toggleReportStatus(
              '${report.id}',
              '${status}'
            )"
          >

            ${
              isResolved
                ? "Mark Active"
                : "Mark Resolved"
            }

          </button>


          <button
            class="delete-btn"
            onclick="deleteReport(
              '${report.id}'
            )"
          >

            🗑️ Delete

          </button>

        </div>

      `;


      container.appendChild(
        reportCard
      );

    }
  );

}


// ==========================================
// FILTER REPORTS
// ==========================================

window.filterReports = function () {

  renderReports();

};


// ==========================================
// UPDATE REPORT STATUS
// ==========================================

window.toggleReportStatus =
  async function (reportId, currentStatus) {

    try {

      const newStatus =
        currentStatus === "Resolved"
          ? "Active"
          : "Resolved";


      await updateDoc(
        doc(db, "reports", reportId),
        {
          status: newStatus
        }
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      showMessage(
        "Unable to update report status."
      );

    }

  };


// ==========================================
// DELETE SINGLE REPORT
// ==========================================

window.deleteReport =
  async function (reportId) {

    const confirmed =
      confirm(
        "Are you sure you want to delete this report?"
      );


    if (!confirmed) {

      return;

    }


    try {

      await deleteDoc(
        doc(db, "reports", reportId)
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      showMessage(
        "Unable to delete report."
      );

    }

  };


// ==========================================
// CLEAR ALL REPORTS
// ==========================================

window.clearAllReports =
  async function () {

    if (!currentUser) {

      return;

    }


    const confirmed =
      confirm(
        "Delete all your emergency reports?"
      );


    if (!confirmed) {

      return;

    }


    try {

      const batch =
        writeBatch(db);


      userReports.forEach(
        function (report) {

          batch.delete(
            doc(
              db,
              "reports",
              report.id
            )
          );

        }
      );


      await batch.commit();


      await loadReports();


      showMessage(
        "All reports deleted."
      );


    } catch (error) {

      console.error(error);

      showMessage(
        "Unable to clear reports."
      );

    }

  };


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

  const total =
    userReports.length;


  const active =
    userReports.filter(
      function (report) {

        return (
          report.status !== "Resolved"
        );

      }
    ).length;


  const resolved =
    userReports.filter(
      function (report) {

        return (
          report.status === "Resolved"
        );

      }
    ).length;


  const reportCount =
    getElement("reportCount");

  const totalReports =
    getElement("totalReports");

  const activeReports =
    getElement("activeReports");

  const resolvedReports =
    getElement("resolvedReports");


  if (reportCount) {

    reportCount.textContent =
      total;

  }


  if (totalReports) {

    totalReports.textContent =
      total;

  }


  if (activeReports) {

    activeReports.textContent =
      active;

  }


  if (resolvedReports) {

    resolvedReports.textContent =
      resolved;

  }

}


// ==========================================
// FORMAT FIRESTORE DATE
// ==========================================

function formatDate(timestamp) {

  if (!timestamp) {

    return "Just now";

  }


  try {

    const date =
      timestamp.toDate();


    return date.toLocaleString();


  } catch (error) {

    return "Recently";

  }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  const div =
    document.createElement("div");


  div.textContent =
    value || "";


  return div.innerHTML;

}


// ==========================================
// END OF SCRIPT
// ==========================================
