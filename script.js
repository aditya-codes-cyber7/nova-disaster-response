// ==========================================
// NOVA DISASTER RESPONSE - PHASE 2
// FIREBASE FIRESTORE REAL-TIME INTEGRATION
// ==========================================


// Import Firebase

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

  apiKey: "AIzaSyBcEkoZMt1KZdQ-ch6J1-7KKyQRO542ZRY",

  authDomain: "nova-disaster-response.firebaseapp.com",

  projectId: "nova-disaster-response",

  storageBucket:
    "nova-disaster-response.firebasestorage.app",

  messagingSenderId: "275029136991",

  appId:
    "1:275029136991:web:382543b5ef90263b8364a"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let userLocation = "Location nahi mili";

let allReports = [];


// ==========================================
// FORM OPEN / CLOSE
// ==========================================

function openReportForm() {

  document.getElementById(
    "reportModal"
  ).style.display = "block";

}


function openSOSForm() {

  document.getElementById(
    "reportModal"
  ).style.display = "block";


  document.getElementById(
    "emergencyType"
  ).focus();

}


function closeReportForm() {

  document.getElementById(
    "reportModal"
  ).style.display = "none";

}


// Make functions available to HTML onclick

window.openReportForm = openReportForm;
window.openSOSForm = openSOSForm;
window.closeReportForm = closeReportForm;


// ==========================================
// LOCATION
// ==========================================

function getLocation() {

  let status =
    document.getElementById("locationStatus");


  if (navigator.geolocation) {

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

  else {

    status.innerText =
      "Browser location support nahi karta.";

  }

}


window.getLocation = getLocation;


// ==========================================
// SUBMIT REPORT TO FIRESTORE
// ==========================================

const emergencyForm =
  document.getElementById("emergencyForm");


emergencyForm.addEventListener(

  "submit",

  async function (event) {

    event.preventDefault();


    const name =
      document.getElementById("name").value;


    const type =
      document.getElementById(
        "emergencyType"
      ).value;


    const description =
      document.getElementById(
        "description"
      ).value;


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

          time:
            new Date().toLocaleString()

        }

      );


      alert(
        "Emergency Report Firestore me submit ho gayi! 🚨"
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

      console.error(error);

      alert(
        "Report submit nahi hui. Firebase check karo."
      );

    }

  }

);


// ==========================================
// REAL-TIME REPORT LISTENER
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


      snapshot.forEach(function (document) {

        allReports.push({

          id: document.id,

          ...document.data()

        });

      });


      showReports();

    },


    function (error) {

      console.error(
        "Firestore error:",
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


  // HERO COUNT

  const reportCount =
    document.getElementById(
      "reportCount"
    );


  if (reportCount) {

    reportCount.innerText =
      allReports.length;

  }


  // DASHBOARD TOTAL

  const totalReports =
    document.getElementById(
      "totalReports"
    );


  if (totalReports) {

    totalReports.innerText =
      allReports.length;

  }


  // ACTIVE REPORTS

  const activeReports =
    allReports.filter(

      report =>
        report.status === "Active"

    );


  // RESOLVED REPORTS

  const resolvedReports =
    allReports.filter(

      report =>
        report.status === "Resolved"

    );


  const activeCounter =
    document.getElementById(
      "activeReports"
    );


  if (activeCounter) {

    activeCounter.innerText =
      activeReports.length;

  }


  const resolvedCounter =
    document.getElementById(
      "resolvedReports"
    );


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


  // NO REPORT

  if (filteredReports.length === 0) {

    container.innerHTML = `

      <p class="no-report">
        Abhi koi report nahi hai.
      </p>

    `;

    return;

  }


  container.innerHTML = "";


  // CREATE CARDS

  filteredReports.forEach(

    function (report) {

      const card =
        document.createElement("div");


      card.className =
        "report-card";


      let statusClass =

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


          <span
            class="status-badge ${statusClass}"
          >
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
// UPDATE REPORT STATUS
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
// FILTER
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

    for (

      const report of allReports

    ) {

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
// START REAL-TIME LISTENER
// ==========================================

listenToReports();


// ==========================================
// MODAL OUTSIDE CLICK
// ==========================================

window.onclick = function (event) {

  const modal =
    document.getElementById(
      "reportModal"
    );


  if (event.target === modal) {

    closeReportForm();

  }

};


console.log(
  "🚀 NOVA Phase 2 - Real-time Firestore Connected"
);
