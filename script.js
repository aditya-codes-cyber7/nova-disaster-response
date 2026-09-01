// ========================================
// NOVA Disaster Response - JavaScript
// reports abhi browser ke localStorage me save ho rahi hain
// ========================================

let userLocation = "Location nahi mili";


// ========================================
// FORM OPEN / CLOSE
// ========================================

function openReportForm() {

  document.getElementById("reportModal").style.display = "block";

}


function openSOSForm() {

  document.getElementById("reportModal").style.display = "block";

  // emergency type select karne ke liye focus
  document.getElementById("emergencyType").focus();

}


function closeReportForm() {

  document.getElementById("reportModal").style.display = "none";

}


// ========================================
// LOCATION LENE KA FUNCTION
// ========================================

function getLocation() {

  let status = document.getElementById("locationStatus");


  if (navigator.geolocation) {

    status.innerText =
      "Location le rahe hain... thoda wait karo 📍";


    navigator.geolocation.getCurrentPosition(

      function (position) {

        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;


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

  } else {

    status.innerText =
      "Tumhara browser location support nahi karta.";

  }

}


// ========================================
// NEW REPORT SUBMIT
// ========================================

document.getElementById("emergencyForm").addEventListener(

  "submit",

  function (event) {

    // page reload mat hone do
    event.preventDefault();


    // form ki values le rahe hain

    let name =
      document.getElementById("name").value;


    let type =
      document.getElementById("emergencyType").value;


    let description =
      document.getElementById("description").value;


    // nayi report object

    let report = {

      id: Date.now(),

      name: name,

      type: type,

      description: description,

      location: userLocation,

      time: new Date().toLocaleString(),

      // har nayi report pehle Active hogi
      status: "Active"

    };


    // purani reports nikalo

    let reports = JSON.parse(
      localStorage.getItem("novaReports")
    ) || [];


    // new report sabse upar add karo

    reports.unshift(report);


    // browser me save

    localStorage.setItem(
      "novaReports",
      JSON.stringify(reports)
    );


    alert("Report submit ho gayi! 🚨");


    // form reset

    document.getElementById(
      "emergencyForm"
    ).reset();


    userLocation = "Location nahi mili";


    document.getElementById(
      "locationStatus"
    ).innerText = "";


    // popup band

    closeReportForm();


    // reports aur dashboard update

    showReports();

  }

);


// ========================================
// REPORTS SCREEN PAR DIKHANA
// ========================================

function showReports() {

  // browser se reports nikalo

  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  // ----------------------------------------
  // PURANI REPORTS FIX
  // pehle status nahi tha isliye undefined aa raha tha
  // ----------------------------------------

  reports = reports.map(function (report) {

    if (!report.status) {

      report.status = "Active";

    }

    return report;

  });


  // fixed reports dobara save

  localStorage.setItem(
    "novaReports",
    JSON.stringify(reports)
  );


  let container =
    document.getElementById("reportsContainer");


  // ----------------------------------------
  // HERO REPORT COUNT
  // ----------------------------------------

  let heroCount =
    document.getElementById("reportCount");

  if (heroCount) {

    heroCount.innerText =
      reports.length;

  }


  // ----------------------------------------
  // DASHBOARD COUNTERS
  // ----------------------------------------

  let totalReports =
    document.getElementById("totalReports");

  if (totalReports) {

    totalReports.innerText =
      reports.length;

  }


  // active reports count

  let activeReports = reports.filter(
    function (report) {

      return report.status === "Active";

    }
  );


  // resolved reports count

  let resolvedReports = reports.filter(
    function (report) {

      return report.status === "Resolved";

    }
  );


  let activeCounter =
    document.getElementById("activeReports");

  if (activeCounter) {

    activeCounter.innerText =
      activeReports.length;

  }


  let resolvedCounter =
    document.getElementById("resolvedReports");

  if (resolvedCounter) {

    resolvedCounter.innerText =
      resolvedReports.length;

  }


  // ----------------------------------------
  // FILTER CHECK
  // ----------------------------------------

  let selectedFilter = "All";


  let filterElement =
    document.getElementById("reportFilter");


  if (filterElement) {

    selectedFilter =
      filterElement.value;

  }


  let filteredReports = reports;


  // All nahi hai toh type ke according filter

  if (selectedFilter !== "All") {

    filteredReports = reports.filter(
      function (report) {

        return report.type === selectedFilter;

      }
    );

  }


  // ----------------------------------------
  // AGAR KOI REPORT NAHI HAI
  // ----------------------------------------

  if (filteredReports.length === 0) {

    container.innerHTML = `

      <p class="no-report">
        Abhi is category me koi report nahi hai.
      </p>

    `;

    return;

  }


  // purana content hatao

  container.innerHTML = "";


  // ----------------------------------------
  // HAR REPORT KA CARD BANAO
  // ----------------------------------------

  filteredReports.forEach(function (report) {

    let card =
      document.createElement("div");


    card.className =
      "report-card";


    // status ke hisaab se CSS class

    let statusClass = "";


    if (report.status === "Active") {

      statusClass =
        "active-status";

    } else {

      statusClass =
        "resolved-status";

    }


    // status toggle button

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


    // card ka content

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
          onclick="deleteReport(${report.id})"
        >
          🗑️ Delete
        </button>

      </div>

    `;


    // card page me add

    container.appendChild(card);

  });

}


// ========================================
// STATUS CHANGE
// Active <-> Resolved
// ========================================

function toggleStatus(id) {

  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  reports = reports.map(function (report) {

    if (report.id === id) {

      // agar purani report hai aur status nahi hai
      // pehle Active maan lo

      if (!report.status) {

        report.status = "Active";

      }


      // status change

      if (report.status === "Active") {

        report.status = "Resolved";

      } else {

        report.status = "Active";

      }

    }


    return report;

  });


  // updated reports save

  localStorage.setItem(
    "novaReports",
    JSON.stringify(reports)
  );


  // page update

  showReports();

}


// ========================================
// SINGLE REPORT DELETE
// ========================================

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


  // jiski id match nahi karti usko rakho

  reports = reports.filter(
    function (report) {

      return report.id !== id;

    }
  );


  localStorage.setItem(
    "novaReports",
    JSON.stringify(reports)
  );


  showReports();

}


// ========================================
// CLEAR ALL REPORTS
// ========================================

function clearAllReports() {

  let confirmClear = confirm(

    "Saari reports delete ho jayengi. Sure ho?"

  );


  if (!confirmClear) {

    return;

  }


  // pura localStorage data remove

  localStorage.removeItem(
    "novaReports"
  );


  showReports();

}


// ========================================
// FILTER REPORTS
// ========================================

function filterReports() {

  showReports();

}


// ========================================
// PAGE LOAD
// ========================================

// page khulte hi reports dikhao

showReports();


// ========================================
// POPUP KE BAHAR CLICK
// ========================================

window.onclick = function (event) {

  let modal =
    document.getElementById("reportModal");


  if (event.target === modal) {

    closeReportForm();

  }

};


// console check

console.log(
  "NOVA Disaster Response upgraded version chal raha hai 🚀"
);
