console.log("signup.js loaded");
function checkPassword(){

    let password =
    document.getElementById("password").value;

    let message =
    document.getElementById("passwordMessage");

    const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(password==""){

        message.innerHTML="";
        return;
    }

    if(strongPassword.test(password)){

        message.style.color="green";
        message.innerHTML="✅ Strong Password";

    }else{

        message.style.color="red";
        message.innerHTML=
        "❌ Password must contain:<br>" +
        "• Minimum 8 characters<br>" +
        "• Uppercase letter<br>" +
        "• Lowercase letter<br>" +
        "• Number<br>" +
        "• Special character";
    }

}

let verified = false;

async function sendOTP(){

    console.log("Send OTP button clicked");

    let email =
    document.getElementById("email").value.trim();

    if(email==""){

        alert("Please enter your email.");
        return;
    }
    const emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailPattern.test(email)){

    alert("Please enter a valid email address.");
    return;
}

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/send-otp",
    {
        method:"POST",

        headers:{
            "Content-Type":"application/json"
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
document.getElementById("email").value.trim();

let otp =
document.getElementById("otp").value.trim();

if(otp==""){

    alert("Please enter OTP.");
    return;
}

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/verify-otp",
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
    document.getElementById("name").value.trim();

    let lastName =
    document.getElementById("lastName").value.trim();

    let email =
    document.getElementById("email").value.trim();

    let password =
    document.getElementById("password").value;

    let confirmPassword =
    document.getElementById("confirmPassword").value;

    // Check empty fields

    if(
        name=="" ||
        lastName=="" ||
        email=="" ||
        password==""||
        confirmPassword==""
    ){
        alert("Please fill all fields.");
        return;
    }

    // Strong Password

    const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(!strongPassword.test(password)){

        alert("Password must contain:\n\nMinimum 8 characters\nUppercase Letter\nLowercase Letter\nNumber\nSpecial Character");

        return;
    }

    // Confirm Password

    if(password!==confirmPassword){

        alert("Passwords do not match.");

        return;
    }

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/signup",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            name,
            lastName,
            email,
            password

        })

    });

    const data =
    await response.json();

    alert(data.message);

    if(data.message=="Account Created Successfully"){

        window.location.href="login.html";

    }

}