// yaha SOS button click hone par message aayega

function sendSOS() {

  // pehle user se confirm karwa rahe hain
  let confirmSOS = confirm(
    "Are you sure? Emergency SOS send karna hai?"
  );

  if (confirmSOS) {

    alert(
      "SOS request received! 🚨\n\nDemo version hai, actual emergency service ko message nahi gaya."
    );

    console.log("SOS button clicked");

  } else {

    console.log("SOS cancel kar diya");

  }

}


// page load hone par bas ek chota sa message console me

console.log("NOVA Disaster Response loaded successfully 🚀");
