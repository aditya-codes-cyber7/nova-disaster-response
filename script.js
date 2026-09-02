// ==========================================
// NOVA DISASTER RESPONSE
// FINAL PHASE 4
// FIREBASE AUTH + FIRESTORE + USER ROLES
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
  where,
  getDoc,
  setDoc,
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

  storageBucket:
    "nova-disaster-response.firebasestorage.app",

  messagingSenderId:
    "275029136991",

  appId:
    "1:275029136991:web:382543b5ef90263b8364a"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const googleProvider =
  new GoogleAuthProvider();


// ==========================================
// ADMIN CONFIG
// IMPORTANT: PUT YOUR ADMIN EMAIL HERE
// ==========================================

const ADMIN_EMAIL =
  "aditya9288raj@gmail.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let userLocation =
  "Location nahi mili";

let allReports = [];

let currentUserRole =
  "user";

let unsubscribeReports =
  null;


// ==========================================
// REPORT MODAL
// ==========================================

function openReportForm() {

  if (!auth.currentUser) {

    alert(
      "Emergency report submit karne ke liye pehle login karo!"
    );

    openLoginModal();

    return;

  }


  const modal =
    document.getElementById(
      "reportModal"
    );


  if (modal) {

    modal.style.display =
      "block";

  }

}


function openSOSForm() {

  openReportForm();


  setTimeout(() => {

    const emergencyType =
      document.getElementById(
        "emergencyType"
      );


    if (emergencyType) {

      emergencyType.focus();

    }

  }, 100);

}


function closeReportForm() {

  const modal =
    document.getElementById(
      "reportModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }

}


window.openReportForm =
  openReportForm;

window.openSOSForm =
  openSOSForm;

window.closeReportForm =
  closeReportForm;



// ==========================================
// LOCATION
// ==========================================

function getLocation() {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (!navigator.geolocation) {

    if (status) {

      status.innerText =
        "Browser location support nahi karta.";

    }

    return;

  }


  if (status) {

    status.innerText =
      "Location le rahe hain... 📍";

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
          "Location mil gayi ✅";

      }

    },


    function () {

      if (status) {

        status.innerText =
          "Location allow nahi hui.";

      }

    }

  );

}


window.getLocation =
  getLocation;



// ==========================================
// SUBMIT EMERGENCY REPORT
// ==========================================

const emergencyForm =
  document.getElementById(
    "emergencyForm"
  );


if (emergencyForm) {

  emergencyForm.addEventListener(

    "submit",

    async function (event) {

      event.preventDefault();


      const currentUser =
        auth.currentUser;


      // USER LOGIN CHECK

      if (!currentUser) {

        alert(
          "Report submit karne ke liye pehle login karo!"
        );

        closeReportForm();

        openLoginModal();

        return;

      }


      const nameElement =
        document.getElementById(
          "name"
        );


      const typeElement =
        document.getElementById(
          "emergencyType"
        );


      const descriptionElement =
        document.getElementById(
          "description"
        );


      const name =
        nameElement
          ? nameElement.value.trim()
          : "";


      const type =
        typeElement
          ? typeElement.value
          : "";


      const description =
        descriptionElement
          ? descriptionElement.value.trim()
          : "";


      if (!type || !description) {

        alert(
          "Emergency details fill karo!"
        );

        return;

      }


      try {

        // SAVE REPORT WITH USER ID

        await addDoc(

          collection(
            db,
            "reports"
          ),

          {

            // USER INFORMATION

            userId:
              currentUser.uid,

            userEmail:
              currentUser.email || "",

            userName:
              currentUser.displayName ||
              name ||
              "NOVA User",


            // REPORT INFORMATION

            name:
              name ||
              currentUser.displayName ||
              "NOVA User",

            type:
              type,

            description:
              description,

            location:
              userLocation,


            // REPORT STATUS

            status:
              "Active",


            // TIME

            timestamp:
              Date.now(),

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


        const locationStatus =
          document.getElementById(
            "locationStatus"
          );


        if (locationStatus) {

          locationStatus.innerText =
            "";

        }


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
// CREATE USER PROFILE IN FIRESTORE
// ==========================================

async function createUserProfile(user) {

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnapshot =
      await getDoc(userRef);


    // IF USER ALREADY EXISTS

    if (userSnapshot.exists()) {

      const data =
        userSnapshot.data();


      currentUserRole =
        data.role || "user";


      return;

    }


    // CHECK ADMIN EMAIL

    const role =
      user.email === ADMIN_EMAIL
        ? "admin"
        : "user";


    // CREATE USER PROFILE

    await setDoc(

      userRef,

      {

        uid:
          user.uid,

        name:
          user.displayName ||
          "NOVA User",

        email:
          user.email || "",

        role:
          role,

        createdAt:
          serverTimestamp()

      }

    );


    currentUserRole =
      role;


    console.log(
      "User profile created:",
      role
    );

  }


  catch (error) {

    console.error(
      "User Profile Error:",
      error
    );

  }

}



// ==========================================
// GET USER ROLE
// ==========================================

async function getUserRole(user) {

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnapshot =
      await getDoc(userRef);


    if (userSnapshot.exists()) {

      const userData =
        userSnapshot.data();


      currentUserRole =
        userData.role || "user";


    }

    else {

      await createUserProfile(
        user
      );

    }


    // EXTRA ADMIN EMAIL CHECK

    if (
      user.email === ADMIN_EMAIL
    ) {

      currentUserRole =
        "admin";


      await setDoc(

        userRef,

        {
          role: "admin"
        },

        {
          merge: true
        }

      );

    }


    console.log(
      "Current User Role:",
      currentUserRole
    );


  }


  catch (error) {

    console.error(
      "Role Error:",
      error
    );


    currentUserRole =
      "user";

  }

}



// ==========================================
// FIRESTORE REPORT LISTENER
// ==========================================

function listenToReports() {

  const currentUser =
    auth.currentUser;


  // STOP OLD LISTENER

  if (unsubscribeReports) {

    unsubscribeReports();

    unsubscribeReports =
      null;

  }


  // NO USER

  if (!currentUser) {

    allReports = [];

    showReports();

    return;

  }


  let reportsQuery;


  // ==========================================
  // ADMIN CAN SEE ALL REPORTS
  // ==========================================

  if (
    currentUserRole === "admin"
  ) {

    console.log(
      "👑 Admin: Loading all reports"
    );


    reportsQuery =
      query(
        collection(
          db,
          "reports"
        )
      );

  }


  // ==========================================
  // NORMAL USER CAN SEE ONLY OWN REPORTS
  // ==========================================

  else {

    console.log(
      "👤 User: Loading only personal reports"
    );


    reportsQuery =
      query(

        collection(
          db,
          "reports"
        ),

        where(
          "userId",
          "==",
          currentUser.uid
        )

      );

  }


  // REAL TIME LISTENER

  unsubscribeReports =
    onSnapshot(

      reportsQuery,


      function (snapshot) {

        allReports = [];


        snapshot.forEach(

          function (document) {

            allReports.push({

              id:
                document.id,

              ...document.data()

            });

          }

        );


        // SORT LATEST FIRST

        allReports.sort(

          function (a, b) {

            return (
              (b.timestamp || 0) -
              (a.timestamp || 0)
            );

          }

        );


        showReports();


        console.log(
          "Reports loaded:",
          allReports.length
        );

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
// SHOW REPORTS
// ==========================================

function showReports() {

  const container =
    document.getElementById(
      "reportsContainer"
    );


  if (!container) {

    return;

  }


  // ==========================================
  // COUNTERS
  // ==========================================

  const reportCount =
    document.getElementById(
      "reportCount"
    );


  const totalReports =
    document.getElementById(
      "totalReports"
    );


  const activeCounter =
    document.getElementById(
      "activeReports"
    );


  const resolvedCounter =
    document.getElementById(
      "resolvedReports"
    );


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


  // ==========================================
  // FILTER
  // ==========================================

  const filterElement =
    document.getElementById(
      "reportFilter"
    );


  let selectedFilter =
    "All";


  if (filterElement) {

    selectedFilter =
      filterElement.value;

  }


  let filteredReports =
    allReports;


  if (
    selectedFilter !== "All" &&
    selectedFilter !== "All Emergencies"
  ) {

    filteredReports =
      allReports.filter(

        report =>
          report.type ===
          selectedFilter

      );

  }


  // ==========================================
  // NO REPORTS
  // ==========================================

  if (
    filteredReports.length === 0
  ) {

    container.innerHTML = `

      <div class="no-report">

        <h3>📭 No Reports Found</h3>

        <p>
          ${auth.currentUser
            ? "Abhi koi emergency report nahi hai."
            : "Reports dekhne ke liye login karo."
          }
        </p>

      </div>

    `;


    return;

  }


  container.innerHTML =
    "";


  // ==========================================
  // CREATE REPORT CARDS
  // ==========================================

  filteredReports.forEach(

    function (report) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "report-card";


      const statusClass =

        report.status === "Active"

          ? "active-status"

          : "resolved-status";


      // ========================================
      // ADMIN ONLY ACTIONS
      // ========================================

      let adminActions =
        "";


      if (
        currentUserRole === "admin"
      ) {

        let statusButton =
          "";


        if (
          report.status === "Active"
        ) {

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


        adminActions = `

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


      // ========================================
      // ADMIN USER INFORMATION
      // ========================================

      let userInfo =
        "";


      if (
        currentUserRole === "admin"
      ) {

        userInfo = `

          <p>
            <strong>👤 Reported By:</strong>
            ${report.userName || report.name || "Unknown"}
          </p>

          <p>
            <strong>📧 Email:</strong>
            ${report.userEmail || "Not available"}
          </p>

        `;

      }


      // ========================================
      // REPORT CARD HTML
      // ========================================

      card.innerHTML = `

        <div class="report-top">

          <h3>
            🚨 ${report.type || "Emergency"}
          </h3>


          <span
            class="status-badge ${statusClass}"
          >
            ${report.status || "Active"}
          </span>

        </div>


        ${userInfo}


        <p>
          <strong>Problem:</strong>
          ${report.description || "No description"}
        </p>


        <p>
          <strong>📍 Location:</strong>
          ${report.location || "Location unavailable"}
        </p>


        <p>
          <strong>🕒 Time:</strong>
          ${report.time || "Unknown"}
        </p>


        ${adminActions}

      `;


      container.appendChild(
        card
      );

    }

  );


  updateAdminControls();

}



// ==========================================
// ADMIN CONTROL VISIBILITY
// ==========================================

function updateAdminControls() {

  const clearButton =
    document.getElementById(
      "clearAllBtn"
    );


  if (clearButton) {

    if (
      currentUserRole === "admin"
    ) {

      clearButton.style.display =
        "block";

    }

    else {

      clearButton.style.display =
        "none";

    }

  }

}



// ==========================================
// TOGGLE REPORT STATUS
// ADMIN ONLY
// ==========================================

async function toggleStatus(id) {

  // SECURITY CHECK

  if (
    currentUserRole !== "admin"
  ) {

    alert(
      "❌ Sirf Admin report status change kar sakta hai!"
    );

    return;

  }


  try {

    const report =
      allReports.find(

        report =>
          report.id === id

      );


    if (!report) {

      return;

    }


    const newStatus =

      report.status === "Active"

        ? "Resolved"

        : "Active";


    await updateDoc(

      doc(
        db,
        "reports",
        id
      ),

      {

        status:
          newStatus,

        updatedAt:
          Date.now()

      }

    );


    console.log(
      "Status Updated:",
      newStatus
    );

  }


  catch (error) {

    console.error(
      "Status Error:",
      error
    );


    alert(
      "Status update nahi hua."
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

  if (
    currentUserRole !== "admin"
  ) {

    alert(
      "❌ Sirf Admin reports delete kar sakta hai!"
    );

    return;

  }


  const confirmDelete =
    confirm(

      "Pakki baat? Ye report permanently delete ho jayegi."

    );


  if (!confirmDelete) {

    return;

  }


  try {

    await deleteDoc(

      doc(
        db,
        "reports",
        id
      )

    );


    console.log(
      "Report deleted"
    );

  }


  catch (error) {

    console.error(
      "Delete Error:",
      error
    );


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
// ADMIN ONLY
// ==========================================

async function clearAllReports() {

  if (
    currentUserRole !== "admin"
  ) {

    alert(
      "❌ Sirf Admin saari reports delete kar sakta hai!"
    );

    return;

  }


  const confirmClear =
    confirm(

      "⚠️ Saari reports permanently delete ho jayengi. Sure ho?"

    );


  if (!confirmClear) {

    return;

  }


  try {

    for (
      const report of allReports
    ) {

      await deleteDoc(

        doc(
          db,
          "reports",
          report.id
        )

      );

    }


    alert(
      "All reports deleted!"
    );

  }


  catch (error) {

    console.error(
      "Clear All Error:",
      error
    );


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
    document.getElementById(
      "loginModal"
    );


  if (modal) {

    modal.style.display =
      "block";

  }

}


function closeLoginModal() {

  const modal =
    document.getElementById(
      "loginModal"
    );


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
    document.getElementById(
      "signupModal"
    );


  if (modal) {

    modal.style.display =
      "block";

  }

}


function closeSignupModal() {

  const modal =
    document.getElementById(
      "signupModal"
    );


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

  const nameInput =
    document.getElementById(
      "signupName"
    );


  const emailInput =
    document.getElementById(
      "signupEmail"
    );


  const passwordInput =
    document.getElementById(
      "signupPassword"
    );


  const name =
    nameInput
      ? nameInput.value.trim()
      : "";


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (
    !email ||
    !password
  ) {

    alert(
      "Email aur password fill karo!"
    );

    return;

  }


  if (
    password.length < 6
  ) {

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


    const user =
      userCredential.user;


    // UPDATE DISPLAY NAME

    if (name) {

      await updateProfile(

        user,

        {

          displayName:
            name

        }

      );

    }


    // CREATE USER PROFILE

    await createUserProfile(
      user
    );


    alert(
      "Account successfully create ho gaya! 🎉"
    );


    closeSignupModal();


    const signupForm =
      document.getElementById(
        "signupForm"
      );


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
      error.code ===
      "auth/email-already-in-use"
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

  const emailInput =
    document.getElementById(
      "loginEmail"
    );


  const passwordInput =
    document.getElementById(
      "loginPassword"
    );


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (
    !email ||
    !password
  ) {

    alert(
      "Email aur password fill karo!"
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
      document.getElementById(
        "loginForm"
      );


    if (loginForm) {

      loginForm.reset();

    }

  }


  catch (error) {

    console.error(
      "Login Error:",
      error.code
    );


    if (
      error.code ===
      "auth/invalid-credential"
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
// GOOGLE LOGIN / SIGNUP
// ==========================================

async function googleLogin() {

  try {

    const result =

      await signInWithPopup(

        auth,
        googleProvider

      );


    const user =
      result.user;


    // CREATE PROFILE IF NEW USER

    await createUserProfile(
      user
    );


    closeLoginModal();

    closeSignupModal();


    console.log(
      "Google Login Successful:",
      user.email
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

    await signOut(
      auth
    );


    currentUserRole =
      "user";


    allReports =
      [];


    if (unsubscribeReports) {

      unsubscribeReports();

      unsubscribeReports =
        null;

    }


    showReports();


    alert(
      "Logout successful! 👋"
    );

  }


  catch (error) {

    console.error(
      "Logout Error:",
      error
    );


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


    // ========================================
    // USER LOGGED IN
    // ========================================

    if (user) {

      console.log(
        "🔐 User logged in:",
        user.email
      );


      // GET ROLE

      await getUserRole(
        user
      );


      // UPDATE NAVBAR

      if (authButtons) {

        authButtons.style.display =
          "none";

      }


      if (userProfile) {

        userProfile.style.display =
          "flex";

      }


      if (userName) {

        const roleBadge =

          currentUserRole === "admin"

            ? "👑 Admin: "

            : "👤 ";


        userName.innerText =

          roleBadge +

          (
            user.displayName ||
            user.email
          );

      }


      // LOAD REPORTS BASED ON ROLE

      listenToReports();


      // CLOSE MODALS

      closeLoginModal();

      closeSignupModal();


    }


    // ========================================
    // USER LOGGED OUT
    // ========================================

    else {

      console.log(
        "🔓 No user logged in"
      );


      currentUserRole =
        "user";


      if (authButtons) {

        authButtons.style.display =
          "flex";

      }


      if (userProfile) {

        userProfile.style.display =
          "none";

      }


      if (unsubscribeReports) {

        unsubscribeReports();

        unsubscribeReports =
          null;

      }


      allReports =
        [];


      showReports();


      updateAdminControls();

    }

  }

);



// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
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
      event.target ===
      reportModal
    ) {

      closeReportForm();

    }


    if (
      event.target ===
      loginModal
    ) {

      closeLoginModal();

    }


    if (
      event.target ===
      signupModal
    ) {

      closeSignupModal();

    }

  }

);



// ==========================================
// INITIAL UI
// ==========================================

updateAdminControls();

showReports();



// ==========================================
// CONSOLE STATUS
// ==========================================

console.log(
  "🚀 NOVA Phase 4 Loaded"
);

console.log(
  "🔐 Firebase Authentication Active"
);

console.log(
  "🔥 Firestore Real-time Database Active"
);

console.log(
  "👤 User Specific Reports Active"
);

console.log(
  "👑 Role Based Access System Active"
);
