// NOVA ka simple javascript part
// abhi reports browser ke andar save ho rahi hain

let userLocation = "Location nahi mili";


// form open karne ke liye

function openReportForm() {

  document.getElementById("reportModal").style.display = "block";

}


// SOS button dabane par bhi wahi form khulega

function openSOSForm() {

  document.getElementById("reportModal").style.display = "block";

  // SOS ke liye emergency type automatically select karne ka try
  document.getElementById("emergencyType").focus();

}


// popup band karne ke liye

function closeReportForm() {

  document.getElementById("reportModal").style.display = "none";

}


// user ki location lene ka function

function getLocation() {

  let status = document.getElementById("locationStatus");

  // check kar rahe hain browser location support karta hai ya nahi

  if (navigator.geolocation) {

    status.innerText = "Location le rahe hain... thoda wait karo";

    navigator.geolocation.getCurrentPosition(

      function (position) {

        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        // abhi coordinates save kar rahe hain
        userLocation = latitude.toFixed(5) + ", " + longitude.toFixed(5);

        status.innerText = "Location mil gayi ✅";

      },

      function () {

        status.innerText = "Location allow nahi hui ya nahi mil payi.";

      }

    );

  } else {

    status.innerText = "Tumhara browser location support nahi karta.";

  }

}


// form submit hone ka kaam

document.getElementById("emergencyForm").addEventListener(
  "submit",

  function (event) {

    // page refresh hone se rok rahe hain
    event.preventDefault();


    // form se values nikal rahe hain

    let name = document.getElementById("name").value;

    let type = document.getElementById("emergencyType").value;

    let description = document.getElementById("description").value;


    // ek report object bana diya

    let report = {

      id: Date.now(),

      name: name,

      type: type,

      description: description,

      location: userLocation,

      time: new Date().toLocaleString()

    };


    // purani reports nikal rahe hain

    let reports = JSON.parse(
      localStorage.getItem("novaReports")
    ) || [];


    // new report add kar di

    reports.unshift(report);


    // browser me save kar diya

    localStorage.setItem(
      "novaReports",
      JSON.stringify(reports)
    );


    alert("Report submit ho gayi! 🚨");


    // form reset

    document.getElementById("emergencyForm").reset();


    userLocation = "Location nahi mili";


    document.getElementById("locationStatus").innerText = "";


    // popup band

    closeReportForm();


    // dashboard update

    showReports();

  }

);


// reports screen par dikhane ka function

function showReports() {

  let reports = JSON.parse(
    localStorage.getItem("novaReports")
  ) || [];


  let container = document.getElementById("reportsContainer");

  let count = document.getElementById("reportCount");


  // total reports update

  count.innerText = reports.length;


  // agar koi report nahi hai

  if (reports.length === 0) {

    container.innerHTML = `
      <p class="no-report">
        Abhi tak koi report submit nahi hui.
      </p>
    `;

    return;

  }


  // purana content hata rahe hain

  container.innerHTML = "";


  // har report ka card bana rahe hain

  reports.forEach(function (report) {

    let card = document.createElement("div");

    card.className = "report-card";


    card.innerHTML = `

      <h3>🚨 ${report.type}</h3>

      <p><strong>Name:</strong> ${report.name}</p>

      <p><strong>Problem:</strong> ${report.description}</p>

      <p><strong>Location:</strong> ${report.location}</p>

      <p><strong>Time:</strong> ${report.time}</p>

    `;


    container.appendChild(card);

  });

}


// page open hote hi purani reports dikhao

showReports();


// agar popup ke bahar click kare toh band ho jaye

window.onclick = function (event) {

  let modal = document.getElementById("reportModal");

  if (event.target === modal) {

    closeReportForm();

  }

};


// console me check karne ke liye

console.log("NOVA website chal rahi hai 🚀");
