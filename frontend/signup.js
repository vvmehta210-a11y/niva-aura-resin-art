let verified = false;

async function sendOTP(){

    let email =
    document.getElementById("email").value;

    const response =
    await fetch(
    "http://localhost:5000/send-otp",
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            email
        })
    });

    const data =
    await response.json();

    alert(data.message);
}

async function verifyOTP(){

    let email =
    document.getElementById("email").value;

    let otp =
    document.getElementById("otp").value;

    const response =
    await fetch(
    "http://localhost:5000/verify-otp",
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            email,
            otp
        })
    });

    const data =
    await response.json();

    if(data.message ===
       "OTP Verified Successfully"){

        createAccount();

    }else{

        alert("Wrong OTP");
    }
}

async function createAccount(){

    let name =
    document.getElementById("name").value;

    let email =
    document.getElementById("email").value;

    let password =
    document.getElementById("password").value;

    const response =
    await fetch(
    "http://localhost:5000/signup",
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            name,
            email,
            password

        })
    });

    const data =
    await response.json();

    alert(data.message);

    if(data.message ===
       "Account Created Successfully"){

        window.location.href =
        "login.html";
    }
}