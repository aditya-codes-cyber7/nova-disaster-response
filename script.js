// ==========================================
// NOVA DISASTER RESPONSE
// PHASE 2 + PHASE 3 + PHASE 4
// FIRESTORE + AUTH + USER SPECIFIC DATA
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
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
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
// GLOBAL VARIABLES
// ==========================================

let userLocation = "Location nahi mili";

let allReports = [];

let unsubscribeReports = null;



// ==========================================
// REPORT MODAL
// ==========================================

function openReportForm() {

  if (!auth.currentUser) {

    alert("Emergency report submit karne ke liye pehle login karo! 🔐");

    openLoginModal();

    return;
  }

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
// USER SPECIFIC DATA
// ==========================================

const emergencyForm =
  document.getElementById("emergencyForm");


if (emergencyForm) {

  emergencyForm.addEventListener(

    "submit",

    async function (event) {

      event.preventDefault();


      // CHECK LOGIN

      const user = auth.currentUser;

      if (!user) {

        alert("Report submit karne ke liye login karo! 🔐");

        closeReportForm();

        openLoginModal();

        return;
      }


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

            // USER INFORMATION

            userId: user.uid,

            userEmail: user.email,

            userName:
              user.displayName ||
              name,


            // REPORT INFORMATION

            name: name,

            type: type,

            description: description,

            location: userLocation,

            status: "Active",

            timestamp: Date.now(),

            time:
              new Date().toLocaleString(),

            createdAt:
              serverTimestamp()

          }

        );


        alert(
          "Emergency Report successfully submit ho gayi! 🚨"
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
// USER SPECIFIC REAL TIME REPORTS
// ==========================================

function listenToReports(userId) {


  // Previous listener stop karo

  if (unsubscribeReports) {

    unsubscribeReports();

    unsubscribeReports = null;

  }


  // No user = no reports

  if (!userId) {

    allReports = [];

    showReports();

    return;

  }


  // ONLY CURRENT USER REPORTS

  const reportsQuery = query(

    collection(db, "reports"),

    where("userId", "==", userId),

    orderBy("timestamp", "desc")

  );


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


  // NOT LOGGED IN

  if (!auth.currentUser) {

    container.innerHTML = `
      <p class="no-report">
        🔐 Apni emergency reports dekhne ke liye login karo.
      </p>
    `;

    return;
  }


  // NO REPORTS

  if (filteredReports.length === 0) {

    container.innerHTML = `
      <p class="no-report">
        Abhi tak aapne koi report submit nahi ki hai.
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

  const user = auth.currentUser;

  if (!user) {

    alert("Please login first!");

    return;

  }


  try {

    const report =
      allReports.find(
        report =>
          report.id === id
      );


    if (!report) return;


    // Extra security check

    if (report.userId !== user.uid) {

      alert("Aap kisi aur ki report edit nahi kar sakte!");

      return;

    }


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

  const user = auth.currentUser;

  if (!user) {

    alert("Please login first!");

    return;

  }


  const confirmDelete = confirm(
    "Pakki baat? Ye report permanently delete ho jayegi."
  );


  if (!confirmDelete) return;


  try {

    const report =
      allReports.find(
        report => report.id === id
      );


    if (!report) return;


    // Extra security check

    if (report.userId !== user.uid) {

      alert("Aap kisi aur ki report delete nahi kar sakte!");

      return;

    }


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
// CLEAR ALL USER REPORTS
// ==========================================

async function clearAllReports() {

  const user = auth.currentUser;


  if (!user) {

    alert("Pehle login karo!");

    return;

  }


  if (allReports.length === 0) {

    alert("Delete karne ke liye koi report nahi hai.");

    return;

  }


  const confirmClear = confirm(
    "Aapki saari reports permanently delete ho jayengi. Sure ho?"
  );


  if (!confirmClear) return;


  try {

    for (const report of allReports) {

      // Only current user's reports

      if (report.userId === user.uid) {

        await deleteDoc(
          doc(db, "reports", report.id)
        );

      }

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
// CREATE USER PROFILE IN FIRESTORE
// ==========================================

async function createUserProfile(user) {

  try {

    const userRef =
      doc(db, "users", user.uid);


    const userSnapshot =
      await getDoc(userRef);


    // Existing user ko overwrite nahi karenge

    if (!userSnapshot.exists()) {

      await setDoc(

        userRef,

        {

          uid: user.uid,

          name:
            user.displayName ||
            "NOVA User",

          email:
            user.email || "",

          photoURL:
            user.photoURL || "",

          role: "user",

          joinedAt:
            serverTimestamp(),

          joinedTime:
            new Date().toLocaleString()

        }

      );

      console.log(
        "👤 User profile created"
      );

    }

  }


  catch (error) {

    console.error(
      "User profile error:",
      error
    );

  }

}



// ==========================================
// EMAIL SIGNUP
// ==========================================

async function signupUser() {

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
      "Name, email aur password sab fill karo!"
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


    // Update Firebase Auth profile

    await updateProfile(

      userCredential.user,

      {
        displayName: name
      }

    );


    // Create user document in Firestore

    await createUserProfile(
      userCredential.user
    );


    alert(
      "Account successfully create ho gaya! 🎉"
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


    // Make sure user profile exists

    await createUserProfile(
      userCredential.user
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

  try {

    const result =
      await signInWithPopup(

        auth,
        googleProvider

      );


    // Create Firestore profile

    await createUserProfile(
      result.user
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


    allReports = [];

    showReports();


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

  async function (user) {

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


    if (user) {

      console.log(
        "🔐 User logged in:",
        user.email
      );


      // Create user profile if missing

      await createUserProfile(user);


      if (authButtons) {
        authButtons.style.display = "none";
      }


      if (userProfile) {
        userProfile.style.display = "flex";
      }


      if (userName) {

        userName.innerText =
          "👤 " +
          (
            user.displayName ||
            user.email
          );

      }


      // LOAD ONLY THIS USER'S REPORTS

      listenToReports(user.uid);

    }


    else {

      console.log(
        "🔓 No user logged in"
      );


      if (authButtons) {
        authButtons.style.display = "flex";
      }


      if (userProfile) {
        userProfile.style.display = "none";
      }


      // Stop report listener

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
// CONSOLE STATUS
// ==========================================

console.log(
  "🚀 NOVA Phase 4 Loaded"
);

console.log(
  "🔐 Authentication Connected"
);

console.log(
  "👤 User Profiles Enabled"
);

console.log(
  "🛡️ User Specific Reports Enabled"
);
