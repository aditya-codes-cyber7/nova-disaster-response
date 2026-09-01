// NOVA ka javascript
// reports abhi browser ke localStorage me save ho rahi hain

let userLocation = "Location nahi mili";


// ================================
// FORM OPEN / CLOSE
// ================================

function openReportForm() {
  document.getElementById("reportModal").style.display = "block";
}


function openSOSForm() {
  document.getElementById("reportModal").style.display = "block";

  document.getElementById("emergencyType").focus();
}


function closeReportForm() {
  document.getElementById("reportModal").style.display = "none";
}


// ================================
// LOCATION
// ================================

function getLocation() {

  let status = document.getElementById("locationStatus");

  if (navigator.geolocation) {

    status.innerText = "Location le rahe hain... thoda wait karo 📍";

    navigator.geolocation.getCurrentPosition(

      function (position) {

        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        userLocation =
          latitude.toFixed(5) +
          ", " +
          longitude.toFixed(5);

        status.innerText = "Location mil gayi ✅";

      },

      function () {

        status.innerText =
          "Location allow nahi hui ya nahi mil payi.";

      }

    );

  } else {

    status.innerText =
      "Tumhara browser location support nahi karta.";

  }

}


// ================================
// NEW REPORT SUBMIT
// ================================

document.getElementById("emergencyForm").addEventListener(
  "submit",

  function (event) {

    event.preventDefault();


    let name = document.getElementById("name").value;

    let type =
      document.getElementById("emergencyType").value;

    let description =
      document.getElementById("description").value;


    // new report object

    let report = {

      id: Date.now(),

      name: name,

      type: type,

      description: description,

      location: userLocation,

      time: new Date().toLocaleString(),

      // new report by default active rahegi
      status: "Active"

    };


    let reports = JSON.parse(
      localStorage.getItem("novaReports")
    ) || [];


    reports.unshift(report);


    localStorage.setItem(
      "novaReports",
      JSON.stringify(reports)
    );


    alert("Report submit ho gayi! 🚨");


    document.getElementById("emergencyForm").reset();

    userLocation = "Location nahi mili";

    document.getElementById(
      "locationStatus"
    ).innerText = "";


    closeReportForm();


    // sab update karo
    showReports();

  }

);


// ================================
// REPORTS SHOW KARNA
// ================================

function showReports() {

  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  let container =
    document.getElementById("reportsContainer");


  // hero wala report count

  document.getElementById(
    "reportCount"
  ).innerText = reports.length;


  // dashboard counters

  document.getElementById(
    "totalReports"
  ).innerText = reports.length;


  let activeReports = reports.filter(
    function (report) {
      return report.status === "Active";
    }
  );


  let resolvedReports = reports.filter(
    function (report) {
      return report.status === "Resolved";
    }
  );


  document.getElementById(
    "activeReports"
  ).innerText = activeReports.length;


  document.getElementById(
    "resolvedReports"
  ).innerText = resolvedReports.length;


  // filter value check

  let selectedFilter =
    document.getElementById("reportFilter").value;


  // agar All select hai toh sab dikhao

  let filteredReports = reports;


  if (selectedFilter !== "All") {

    filteredReports = reports.filter(
      function (report) {

        return report.type === selectedFilter;

      }
    );

  }


  // agar reports nahi hain

  if (filteredReports.length === 0) {

    container.innerHTML = `

      <p class="no-report">
        Abhi is category me koi report nahi hai.
      </p>

    `;

    return;

  }


  // container clear

  container.innerHTML = "";


  // cards banana

  filteredReports.forEach(function (report) {

    let card = document.createElement("div");

    card.className = "report-card";


    // status ke according class

    let statusClass = "";

    if (report.status === "Active") {
      statusClass = "active-status";
    } else {
      statusClass = "resolved-status";
    }


    // status button text

    let statusButton = "";

    if (report.status === "Active") {

      statusButton = `
        <button
          class="resolve-btn"
          onclick="toggleStatus(${report.id})"
        >
          ✅ Mark Resolved
        </button>
      `;

    } else {

      statusButton = `
        <button
          class="active-btn"
          onclick="toggleStatus(${report.id})"
        >
          🔄 Mark Active
        </button>
      `;

    }


    card.innerHTML = `

      <div class="report-top">

        <h3>🚨 ${report.type}</h3>

        <span class="status-badge ${statusClass}">
          ${report.status}
        </span>

      </div>


      <p><strong>Name:</strong> ${report.name}</p>

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
          onclick="deleteReport(${report.id})"
        >
          🗑️ Delete
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}


// ================================
// STATUS CHANGE
// ================================

function toggleStatus(id) {

  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  reports = reports.map(function (report) {

    if (report.id === id) {

      if (report.status === "Active") {

        report.status = "Resolved";

      } else {

        report.status = "Active";

      }

    }

    return report;

  });


  localStorage.setItem(
    "novaReports",
    JSON.stringify(reports)
  );


  showReports();

}


// ================================
// SINGLE REPORT DELETE
// ================================

function deleteReport(id) {

  let confirmDelete = confirm(
    "Pakki baat? Ye report delete ho jayegi."
  );


  if (!confirmDelete) {
    return;
  }


  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  reports = reports.filter(function (report) {

    return report.id !== id;

  });


  localStorage.setItem(
    "novaReports",
    JSON.stringify(reports)
  );


  showReports();

}


// ================================
// CLEAR ALL REPORTS
// ================================

function clearAllReports() {

  let confirmClear = confirm(
    "Saari reports delete ho jayengi. Sure ho?"
  );


  if (!confirmClear) {
    return;
  }


  localStorage.removeItem("novaReports");


  showReports();

}


// ================================
// FILTER REPORTS
// ================================

function filterReports() {

  showReports();

}


// ================================
// PAGE LOAD
// ================================

showReports();


// popup ke bahar click

window.onclick = function (event) {

  let modal =
    document.getElementById("reportModal");

  if (event.target === modal) {

    closeReportForm();

  }

};


console.log(
  "NOVA upgraded dashboard chal raha hai 🚀"
);
