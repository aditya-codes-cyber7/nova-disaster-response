// ========================================
// NOVA DISASTER RESPONSE SYSTEM
// FIREBASE + FIRESTORE VERSION
// ========================================


import {

  db,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy

} from "./firebase.js";


// ========================================
// GLOBAL VARIABLES
// ========================================

let userLocation = "Location nahi mili";

let allReports = [];


// ========================================
// FORM OPEN / CLOSE
// ========================================

function openReportForm() {

  document.getElementById("reportModal").style.display = "block";

}


function openSOSForm() {

  document.getElementById("reportModal").style.display = "block";

  setTimeout(function () {

    document.getElementById("emergencyType").focus();

  }, 300);

}


function closeReportForm() {

  document.getElementById("reportModal").style.display = "none";

}


// ========================================
// LOCATION
// ========================================

function getLocation() {

  let status = document.getElementById("locationStatus");


  if (navigator.geolocation) {

    status.innerText =
      "Location le rahe hain... thoda wait karo 📍";


    navigator.geolocation.getCurrentPosition(

      function (position) {

        let latitude =
          position.coords.latitude;

        let longitude =
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
          "Location allow nahi hui ya nahi mil payi.";

      }

    );

  }


  else {

    status.innerText =
      "Tumhara browser location support nahi karta.";

  }

}


// ========================================
// SUBMIT NEW REPORT TO FIREBASE
// ========================================

document
  .getElementById("emergencyForm")
  .addEventListener(

    "submit",

    async function (event) {

      event.preventDefault();


      let name =
        document.getElementById("name").value;


      let type =
        document.getElementById(
          "emergencyType"
        ).value;


      let description =
        document.getElementById(
          "description"
        ).value;


      // Validation

      if (!name || !type || !description) {

        alert(
          "Please saari details fill karo!"
        );

        return;

      }


      try {

        // Add report to Firestore

        await addDoc(

          collection(db, "reports"),

          {

            name: name,

            type: type,

            description: description,

            location: userLocation,

            time:
              new Date().toLocaleString(),

            timestamp:
              Date.now(),

            status: "Active"

          }

        );


        alert(
          "Emergency report Firebase par successfully submit ho gayi! 🚨"
        );


        // Reset form

        document
          .getElementById("emergencyForm")
          .reset();


        userLocation =
          "Location nahi mili";


        document
          .getElementById(
            "locationStatus"
          )
          .innerText = "";


        closeReportForm();

      }


      catch (error) {

        console.error(error);


        alert(
          "Report submit nahi hui. Please dobara try karo."
        );

      }

    }

  );


// ========================================
// REALTIME REPORTS LISTENER
// ========================================

function loadReports() {

  const reportsRef =
    collection(db, "reports");


  const reportsQuery =
    query(
      reportsRef,
      orderBy("timestamp", "desc")
    );


  onSnapshot(

    reportsQuery,


    function (snapshot) {

      allReports = [];


      snapshot.forEach(function (documentData) {

        allReports.push({

          id: documentData.id,

          ...documentData.data()

        });

      });


      showReports();

    },


    function (error) {

      console.error(
        "Firebase Error:",
        error
      );

    }

  );

}


// ========================================
// SHOW REPORTS
// ========================================

function showReports() {


  let container =
    document.getElementById(
      "reportsContainer"
    );


  if (!container) return;


  // =====================================
  // REPORT COUNTS
  // =====================================

  let reportCount =
    document.getElementById(
      "reportCount"
    );


  if (reportCount) {

    reportCount.innerText =
      allReports.length;

  }


  let totalReports =
    document.getElementById(
      "totalReports"
    );


  if (totalReports) {

    totalReports.innerText =
      allReports.length;

  }


  let activeReports =
    allReports.filter(

      function (report) {

        return report.status ===
          "Active";

      }

    );


  let resolvedReports =
    allReports.filter(

      function (report) {

        return report.status ===
          "Resolved";

      }

    );


  let activeCounter =
    document.getElementById(
      "activeReports"
    );


  if (activeCounter) {

    activeCounter.innerText =
      activeReports.length;

  }


  let resolvedCounter =
    document.getElementById(
      "resolvedReports"
    );


  if (resolvedCounter) {

    resolvedCounter.innerText =
      resolvedReports.length;

  }


  // =====================================
  // FILTER
  // =====================================

  let selectedFilter = "All";


  let filterElement =
    document.getElementById(
      "reportFilter"
    );


  if (filterElement) {

    selectedFilter =
      filterElement.value;

  }


  let filteredReports =
    allReports;


  if (selectedFilter !== "All") {

    filteredReports =
      allReports.filter(

        function (report) {

          return report.type ===
            selectedFilter;

        }

      );

  }


  // =====================================
  // NO REPORT
  // =====================================

  if (
    filteredReports.length === 0
  ) {

    container.innerHTML = `

      <div class="no-report">

        <h3>📭 No Reports Found</h3>

        <p>
          Abhi koi emergency report available nahi hai.
        </p>

      </div>

    `;

    return;

  }


  // =====================================
  // CREATE REPORT CARDS
  // =====================================

  container.innerHTML = "";


  filteredReports.forEach(

    function (report) {


      let card =
        document.createElement("div");


      card.className =
        "report-card";


      // Status class

      let statusClass =

        report.status === "Active"

          ? "active-status"

          : "resolved-status";


      // Status button

      let statusButton = "";


      if (
        report.status === "Active"
      ) {

        statusButton = `

          <button
            class="resolve-btn"
            onclick="toggleStatus('${report.id}', '${report.status}')"
          >

            ✅ Mark Resolved

          </button>

        `;

      }


      else {

        statusButton = `

          <button
            class="active-btn"
            onclick="toggleStatus('${report.id}', '${report.status}')"
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

          📍 ${report.location}

        </p>


        <p>

          <strong>Time:</strong>

          🕒 ${report.time}

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


// ========================================
// CHANGE REPORT STATUS
// ========================================

async function toggleStatus(
  id,
  currentStatus
) {


  try {


    let newStatus =

      currentStatus === "Active"

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
          newStatus

      }

    );


  }


  catch (error) {

    console.error(error);

    alert(
      "Status update nahi ho paya."
    );

  }

}


// ========================================
// DELETE SINGLE REPORT
// ========================================

async function deleteReport(id) {


  let confirmDelete =

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


  }


  catch (error) {

    console.error(error);


    alert(
      "Report delete nahi ho payi."
    );

  }

}


// ========================================
// CLEAR ALL REPORTS
// ========================================

async function clearAllReports() {


  let confirmClear =

    confirm(
      "Saari reports permanently delete ho jayengi. Sure ho?"
    );


  if (!confirmClear) {

    return;

  }


  try {


    for (
      let report of allReports
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
      "Saari reports delete ho gayi."
    );


  }


  catch (error) {

    console.error(error);


    alert(
      "Reports delete nahi ho payi."
    );

  }

}


// ========================================
// FILTER REPORTS
// ========================================

function filterReports() {

  showReports();

}


// ========================================
// MODAL OUTSIDE CLICK
// ========================================

window.onclick =
  function (event) {


    let modal =
      document.getElementById(
        "reportModal"
      );


    if (
      event.target === modal
    ) {

      closeReportForm();

    }

  };


// ========================================
// MAKE FUNCTIONS GLOBAL
// ========================================

window.openReportForm =
  openReportForm;

window.openSOSForm =
  openSOSForm;

window.closeReportForm =
  closeReportForm;

window.getLocation =
  getLocation;

window.toggleStatus =
  toggleStatus;

window.deleteReport =
  deleteReport;

window.clearAllReports =
  clearAllReports;

window.filterReports =
  filterReports;


// ========================================
// START APP
// ========================================

loadReports();


console.log(
  "🚀 NOVA Firebase Disaster Response System Running!"
);
