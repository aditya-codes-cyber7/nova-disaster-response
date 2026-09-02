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
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// 🔥 FIREBASE CONFIG
// ==========================================

// IMPORTANT:
// Yaha apna Firebase Console wala EXACT config paste karo.

const firebaseConfig = {

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
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// 🔥 FIREBASE CONFIG
// ==========================================

// IMPORTANT:
// Yaha apna Firebase Console wala EXACT config paste karo.

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
// ADMIN EMAIL
// ==========================================

// IMPORTANT:
// Yaha wahi Gmail daalo jisko admin banana hai.

const ADMIN_EMAIL = "aditya9288raj@gmail.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let isAdmin = false;

let userReports = [];

let currentLocation = null;


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

const clearAllButton =
  document.getElementById("clearAllButton");


// ==========================================
// MODAL FUNCTIONS
// ==========================================

window.openLoginModal = function () {

  document.getElementById("loginModal")
    .style.display = "block";

};


window.closeLoginModal = function () {

  document.getElementById("loginModal")
    .style.display = "none";

};


window.openSignupModal = function () {

  document.getElementById("signupModal")
    .style.display = "block";

};


window.closeSignupModal = function () {

  document.getElementById("signupModal")
    .style.display = "none";

};


window.openReportForm = function () {

  if (!currentUser) {

    alert("Please login first to submit an emergency report.");

    openLoginModal();

    return;

  }


  document.getElementById("reportModal")
    .style.display = "block";

};


window.openSOSForm = function () {

  openReportForm();

};


window.closeReportForm = function () {

  document.getElementById("reportModal")
    .style.display = "none";

};


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click", function (event) {

  const modals = document.querySelectorAll(".modal");

  modals.forEach(function (modal) {

    if (event.target === modal) {

      modal.style.display = "none";

    }

  });

});


// ==========================================
// SIGNUP USER
// ==========================================

window.signupUser = async function () {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;


  if (!name || !email || !password) {

    alert("Please fill all fields.");

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


    await updateProfile(
      userCredential.user,
      {
        displayName: name
      }
    );


    alert("Account created successfully! 🚀");


    document.getElementById("signupForm").reset();

    closeSignupModal();


  } catch (error) {

    alert(error.message);

  }

};


// ==========================================
// LOGIN USER
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


    alert("Login successful! 🎉");


    document.getElementById("loginForm").reset();

    closeLoginModal();


  } catch (error) {

    alert(error.message);

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


    closeLoginModal();

    closeSignupModal();


  } catch (error) {

    alert(error.message);

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
// AUTH STATE
// ==========================================

onAuthStateChanged(
  auth,
  async function (user) {

    currentUser = user;


    if (user) {

      // Check Admin

      isAdmin =
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase();


      // Navbar

      authButtons.style.display = "none";

      userProfile.style.display = "flex";


      userName.textContent =
        isAdmin
          ? `🛡️ Admin: ${user.displayName || user.email}`
          : `👤 ${user.displayName || user.email}`;


      // Clear Button

      if (clearAllButton) {

        clearAllButton.style.display =
          isAdmin
            ? "block"
            : "none";

      }


      await loadReports();


    } else {

      currentUser = null;

      isAdmin = false;

      userReports = [];


      authButtons.style.display = "flex";

      userProfile.style.display = "none";


      if (clearAllButton) {

        clearAllButton.style.display = "none";

      }


      reportsContainer.innerHTML = `
        <p class="no-report">
          🔐 Login to view your emergency reports.
        </p>
      `;


      updateDashboard([]);

    }

  }
);


// ==========================================
// GET LOCATION
// ==========================================

window.getLocation = function () {

  const locationStatus =
    document.getElementById("locationStatus");


  if (!navigator.geolocation) {

    locationStatus.textContent =
      "Geolocation is not supported by this browser.";

    return;

  }


  locationStatus.textContent =
    "Getting location...";


  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      };


      locationStatus.textContent =
        "📍 Location added successfully.";

    },


    function () {

      locationStatus.textContent =
        "Unable to get location.";

    }

  );

};


// ==========================================
// SUBMIT EMERGENCY REPORT
// ==========================================

document
  .getElementById("emergencyForm")
  .addEventListener(
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

      const emergencyType =
        document.getElementById("emergencyType").value;

      const description =
        document.getElementById("description").value.trim();


      if (!name || !emergencyType || !description) {

        alert("Please fill all required fields.");

        return;

      }


      try {

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
              currentLocation,

            status:
              "Active",

            createdAt:
              serverTimestamp()

          }
        );


        alert(
          "Emergency report submitted successfully! 🚨"
        );


        document
          .getElementById("emergencyForm")
          .reset();


        currentLocation = null;


        document
          .getElementById("locationStatus")
          .textContent = "";


        closeReportForm();


        await loadReports();


      } catch (error) {

        console.error(error);

        alert(
          "Error submitting report: " +
          error.message
        );

      }

    }
  );


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

  if (!currentUser) return;


  try {

    let reportsQuery;


    if (isAdmin) {

      reportsQuery =
        query(
          collection(db, "reports"),
          orderBy(
            "createdAt",
            "desc"
          )
        );

    } else {

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


    const snapshot =
      await getDocs(reportsQuery);


    userReports = [];


    snapshot.forEach(function (documentSnapshot) {

      userReports.push({

        id:
          documentSnapshot.id,

        ...documentSnapshot.data()

      });

    });


    // Sort manually
    // avoids Firestore index requirement

    userReports.sort(function (a, b) {

      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;

    });


    displayReports(userReports);


    updateDashboard(userReports);


  } catch (error) {

    console.error(
      "Error loading reports:",
      error
    );


    reportsContainer.innerHTML = `
      <p class="no-report">
        Unable to load reports.
      </p>
    `;

  }

}


// ==========================================
// DISPLAY REPORTS
// ==========================================

function displayReports(reports) {

  if (!currentUser) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        🔐 Login to view your emergency reports.
      </p>
    `;

    return;

  }


  if (reports.length === 0) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        No emergency reports found.
      </p>
    `;

    return;

  }


  reportsContainer.innerHTML = "";


  reports.forEach(function (report) {

    const date = report.createdAt
      ? report.createdAt
          .toDate()
          .toLocaleString()
      : "Just now";


    let adminActions = "";


    // ONLY ADMIN CAN SEE STATUS + ACTIONS

    if (isAdmin) {

      const statusClass =
        report.status === "Resolved"
          ? "resolved-status"
          : "active-status";


      adminActions = `

        <span
          class="status-badge ${statusClass}"
        >
          ${report.status || "Active"}
        </span>


        <div class="report-actions">

          <button
            class="resolve-btn"
            onclick="updateReportStatus(
              '${report.id}',
              'Resolved'
            )"
          >
            ✅ Resolve
          </button>


          <button
            class="active-btn"
            onclick="updateReportStatus(
              '${report.id}',
              'Active'
            )"
          >
            🔴 Mark Active
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

    }


    reportsContainer.innerHTML += `

      <div class="report-card">

        <div class="report-top">

          <h3>
            ${report.emergencyType}
          </h3>

          ${
            isAdmin
              ? adminActions
                  .split('<div class="report-actions">')[0]
              : ""
          }

        </div>


        <p>
          <strong>Name:</strong>
          ${report.name}
        </p>


        ${
          isAdmin
            ? `
              <p>
                <strong>User:</strong>
                ${report.userEmail}
              </p>
            `
            : ""
        }


        <p>
          <strong>Description:</strong>
          ${report.description}
        </p>


        <p>
          <strong>Submitted:</strong>
          ${date}
        </p>


        ${
          report.location &&
          report.location.latitude
            ? `
              <p>
                📍 ${report.location.latitude.toFixed(4)},
                ${report.location.longitude.toFixed(4)}
              </p>
            `
            : ""
        }


        ${
          isAdmin
            ? adminActions.includes(
                '<div class="report-actions">'
              )
                ? '<div class="report-actions">' +
                  adminActions
                    .split(
                      '<div class="report-actions">'
                    )[1]
                : ""
            : ""
        }

      </div>

    `;

  });

}


// ==========================================
// UPDATE REPORT STATUS
// ADMIN ONLY
// ==========================================

window.updateReportStatus =
  async function (
    reportId,
    newStatus
  ) {

    if (!isAdmin) {

      alert(
        "Only admin can update report status."
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


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error updating report status."
      );

    }

  };


// ==========================================
// DELETE REPORT
// ADMIN ONLY
// ==========================================

window.deleteReport =
  async function (reportId) {

    if (!isAdmin) {

      alert(
        "Only admin can delete reports."
      );

      return;

    }


    const confirmation =
      confirm(
        "Delete this emergency report?"
      );


    if (!confirmation) return;


    try {

      await deleteDoc(
        doc(
          db,
          "reports",
          reportId
        )
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error deleting report."
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
        "Only admin can clear reports."
      );

      return;

    }


    const confirmation =
      confirm(
        "Are you sure you want to delete ALL reports?"
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


      const deletePromises = [];


      snapshot.forEach(
        function (documentSnapshot) {

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


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error clearing reports."
      );

    }

  };


// ==========================================
// FILTER REPORTS
// ==========================================

window.filterReports = function () {

  const filter =
    document.getElementById(
      "reportFilter"
    ).value;


  if (filter === "All") {

    displayReports(userReports);

    return;

  }


  const filteredReports =
    userReports.filter(
      function (report) {

        return (
          report.emergencyType ===
          filter
        );

      }
    );


  displayReports(
    filteredReports
  );

};


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(reports) {

  const totalReports =
    document.getElementById(
      "totalReports"
    );

  const reportCount =
    document.getElementById(
      "reportCount"
    );

  const activeReports =
    document.getElementById(
      "activeReports"
    );

  const resolvedReports =
    document.getElementById(
      "resolvedReports"
    );


  // Total reports user/admin both can see

  if (totalReports) {

    totalReports.textContent =
      reports.length;

  }


  if (reportCount) {

    reportCount.textContent =
      reports.length;

  }


  // ONLY ADMIN CAN SEE STATUS COUNTS

  if (isAdmin) {

    const activeCount =
      reports.filter(
        report =>
          report.status === "Active"
      ).length;


    const resolvedCount =
      reports.filter(
        report =>
          report.status === "Resolved"
      ).length;


    if (activeReports) {

      activeReports.textContent =
        activeCount;

    }


    if (resolvedReports) {

      resolvedReports.textContent =
        resolvedCount;

    }

  } else {

    // USER DOES NOT SEE STATUS

    if (activeReports) {

      activeReports.textContent =
        "-";

    }


    if (resolvedReports) {

      resolvedReports.textContent =
        "-";

    }

  }

}
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


// ==========================================
// ADMIN EMAIL
// ==========================================

// IMPORTANT:
// Yaha wahi Gmail daalo jisko admin banana hai.

const ADMIN_EMAIL = "YOUR_ADMIN_GMAIL@gmail.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let isAdmin = false;

let userReports = [];

let currentLocation = null;


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

const clearAllButton =
  document.getElementById("clearAllButton");


// ==========================================
// MODAL FUNCTIONS
// ==========================================

window.openLoginModal = function () {

  document.getElementById("loginModal")
    .style.display = "block";

};


window.closeLoginModal = function () {

  document.getElementById("loginModal")
    .style.display = "none";

};


window.openSignupModal = function () {

  document.getElementById("signupModal")
    .style.display = "block";

};


window.closeSignupModal = function () {

  document.getElementById("signupModal")
    .style.display = "none";

};


window.openReportForm = function () {

  if (!currentUser) {

    alert("Please login first to submit an emergency report.");

    openLoginModal();

    return;

  }


  document.getElementById("reportModal")
    .style.display = "block";

};


window.openSOSForm = function () {

  openReportForm();

};


window.closeReportForm = function () {

  document.getElementById("reportModal")
    .style.display = "none";

};


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click", function (event) {

  const modals = document.querySelectorAll(".modal");

  modals.forEach(function (modal) {

    if (event.target === modal) {

      modal.style.display = "none";

    }

  });

});


// ==========================================
// SIGNUP USER
// ==========================================

window.signupUser = async function () {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPassword").value;


  if (!name || !email || !password) {

    alert("Please fill all fields.");

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


    await updateProfile(
      userCredential.user,
      {
        displayName: name
      }
    );


    alert("Account created successfully! 🚀");


    document.getElementById("signupForm").reset();

    closeSignupModal();


  } catch (error) {

    alert(error.message);

  }

};


// ==========================================
// LOGIN USER
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


    alert("Login successful! 🎉");


    document.getElementById("loginForm").reset();

    closeLoginModal();


  } catch (error) {

    alert(error.message);

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


    closeLoginModal();

    closeSignupModal();


  } catch (error) {

    alert(error.message);

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
// AUTH STATE
// ==========================================

onAuthStateChanged(
  auth,
  async function (user) {

    currentUser = user;


    if (user) {

      // Check Admin

      isAdmin =
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase();


      // Navbar

      authButtons.style.display = "none";

      userProfile.style.display = "flex";


      userName.textContent =
        isAdmin
          ? `🛡️ Admin: ${user.displayName || user.email}`
          : `👤 ${user.displayName || user.email}`;


      // Clear Button

      if (clearAllButton) {

        clearAllButton.style.display =
          isAdmin
            ? "block"
            : "none";

      }


      await loadReports();


    } else {

      currentUser = null;

      isAdmin = false;

      userReports = [];


      authButtons.style.display = "flex";

      userProfile.style.display = "none";


      if (clearAllButton) {

        clearAllButton.style.display = "none";

      }


      reportsContainer.innerHTML = `
        <p class="no-report">
          🔐 Login to view your emergency reports.
        </p>
      `;


      updateDashboard([]);

    }

  }
);


// ==========================================
// GET LOCATION
// ==========================================

window.getLocation = function () {

  const locationStatus =
    document.getElementById("locationStatus");


  if (!navigator.geolocation) {

    locationStatus.textContent =
      "Geolocation is not supported by this browser.";

    return;

  }


  locationStatus.textContent =
    "Getting location...";


  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      };


      locationStatus.textContent =
        "📍 Location added successfully.";

    },


    function () {

      locationStatus.textContent =
        "Unable to get location.";

    }

  );

};


// ==========================================
// SUBMIT EMERGENCY REPORT
// ==========================================

document
  .getElementById("emergencyForm")
  .addEventListener(
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

      const emergencyType =
        document.getElementById("emergencyType").value;

      const description =
        document.getElementById("description").value.trim();


      if (!name || !emergencyType || !description) {

        alert("Please fill all required fields.");

        return;

      }


      try {

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
              currentLocation,

            status:
              "Active",

            createdAt:
              serverTimestamp()

          }
        );


        alert(
          "Emergency report submitted successfully! 🚨"
        );


        document
          .getElementById("emergencyForm")
          .reset();


        currentLocation = null;


        document
          .getElementById("locationStatus")
          .textContent = "";


        closeReportForm();


        await loadReports();


      } catch (error) {

        console.error(error);

        alert(
          "Error submitting report: " +
          error.message
        );

      }

    }
  );


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

  if (!currentUser) return;


  try {

    let reportsQuery;


    if (isAdmin) {

      reportsQuery =
        query(
          collection(db, "reports"),
          orderBy(
            "createdAt",
            "desc"
          )
        );

    } else {

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


    const snapshot =
      await getDocs(reportsQuery);


    userReports = [];


    snapshot.forEach(function (documentSnapshot) {

      userReports.push({

        id:
          documentSnapshot.id,

        ...documentSnapshot.data()

      });

    });


    // Sort manually
    // avoids Firestore index requirement

    userReports.sort(function (a, b) {

      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;

    });


    displayReports(userReports);


    updateDashboard(userReports);


  } catch (error) {

    console.error(
      "Error loading reports:",
      error
    );


    reportsContainer.innerHTML = `
      <p class="no-report">
        Unable to load reports.
      </p>
    `;

  }

}


// ==========================================
// DISPLAY REPORTS
// ==========================================

function displayReports(reports) {

  if (!currentUser) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        🔐 Login to view your emergency reports.
      </p>
    `;

    return;

  }


  if (reports.length === 0) {

    reportsContainer.innerHTML = `
      <p class="no-report">
        No emergency reports found.
      </p>
    `;

    return;

  }


  reportsContainer.innerHTML = "";


  reports.forEach(function (report) {

    const date = report.createdAt
      ? report.createdAt
          .toDate()
          .toLocaleString()
      : "Just now";


    let adminActions = "";


    // ONLY ADMIN CAN SEE STATUS + ACTIONS

    if (isAdmin) {

      const statusClass =
        report.status === "Resolved"
          ? "resolved-status"
          : "active-status";


      adminActions = `

        <span
          class="status-badge ${statusClass}"
        >
          ${report.status || "Active"}
        </span>


        <div class="report-actions">

          <button
            class="resolve-btn"
            onclick="updateReportStatus(
              '${report.id}',
              'Resolved'
            )"
          >
            ✅ Resolve
          </button>


          <button
            class="active-btn"
            onclick="updateReportStatus(
              '${report.id}',
              'Active'
            )"
          >
            🔴 Mark Active
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

    }


    reportsContainer.innerHTML += `

      <div class="report-card">

        <div class="report-top">

          <h3>
            ${report.emergencyType}
          </h3>

          ${
            isAdmin
              ? adminActions
                  .split('<div class="report-actions">')[0]
              : ""
          }

        </div>


        <p>
          <strong>Name:</strong>
          ${report.name}
        </p>


        ${
          isAdmin
            ? `
              <p>
                <strong>User:</strong>
                ${report.userEmail}
              </p>
            `
            : ""
        }


        <p>
          <strong>Description:</strong>
          ${report.description}
        </p>


        <p>
          <strong>Submitted:</strong>
          ${date}
        </p>


        ${
          report.location &&
          report.location.latitude
            ? `
              <p>
                📍 ${report.location.latitude.toFixed(4)},
                ${report.location.longitude.toFixed(4)}
              </p>
            `
            : ""
        }


        ${
          isAdmin
            ? adminActions.includes(
                '<div class="report-actions">'
              )
                ? '<div class="report-actions">' +
                  adminActions
                    .split(
                      '<div class="report-actions">'
                    )[1]
                : ""
            : ""
        }

      </div>

    `;

  });

}


// ==========================================
// UPDATE REPORT STATUS
// ADMIN ONLY
// ==========================================

window.updateReportStatus =
  async function (
    reportId,
    newStatus
  ) {

    if (!isAdmin) {

      alert(
        "Only admin can update report status."
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


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error updating report status."
      );

    }

  };


// ==========================================
// DELETE REPORT
// ADMIN ONLY
// ==========================================

window.deleteReport =
  async function (reportId) {

    if (!isAdmin) {

      alert(
        "Only admin can delete reports."
      );

      return;

    }


    const confirmation =
      confirm(
        "Delete this emergency report?"
      );


    if (!confirmation) return;


    try {

      await deleteDoc(
        doc(
          db,
          "reports",
          reportId
        )
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error deleting report."
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
        "Only admin can clear reports."
      );

      return;

    }


    const confirmation =
      confirm(
        "Are you sure you want to delete ALL reports?"
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


      const deletePromises = [];


      snapshot.forEach(
        function (documentSnapshot) {

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


      await loadReports();


    } catch (error) {

      console.error(error);

      alert(
        "Error clearing reports."
      );

    }

  };


// ==========================================
// FILTER REPORTS
// ==========================================

window.filterReports = function () {

  const filter =
    document.getElementById(
      "reportFilter"
    ).value;


  if (filter === "All") {

    displayReports(userReports);

    return;

  }


  const filteredReports =
    userReports.filter(
      function (report) {

        return (
          report.emergencyType ===
          filter
        );

      }
    );


  displayReports(
    filteredReports
  );

};


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(reports) {

  const totalReports =
    document.getElementById(
      "totalReports"
    );

  const reportCount =
    document.getElementById(
      "reportCount"
    );

  const activeReports =
    document.getElementById(
      "activeReports"
    );

  const resolvedReports =
    document.getElementById(
      "resolvedReports"
    );


  // Total reports user/admin both can see

  if (totalReports) {

    totalReports.textContent =
      reports.length;

  }


  if (reportCount) {

    reportCount.textContent =
      reports.length;

  }


  // ONLY ADMIN CAN SEE STATUS COUNTS

  if (isAdmin) {

    const activeCount =
      reports.filter(
        report =>
          report.status === "Active"
      ).length;


    const resolvedCount =
      reports.filter(
        report =>
          report.status === "Resolved"
      ).length;


    if (activeReports) {

      activeReports.textContent =
        activeCount;

    }


    if (resolvedReports) {

      resolvedReports.textContent =
        resolvedCount;

    }

  } else {

    // USER DOES NOT SEE STATUS

    if (activeReports) {

      activeReports.textContent =
        "-";

    }


    if (resolvedReports) {

      resolvedReports.textContent =
        "-";

    }

  }

}
