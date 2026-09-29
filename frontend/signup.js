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

let timerInterval = null;
let timeLeft = 60;
let otpExpired = false;

async function sendOTP() {

    console.log("Send OTP button clicked");

    let email = document.getElementById("email").value.trim();

    if (email === "") {
        alert("Please enter your email.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/send-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        const data = await response.json();

        console.log("Response:", data);

        if (!response.ok) {
            alert(data.message || "Server Error");
            return;
        }

        alert(data.message);

        // Start countdown timer (60 seconds)
        clearInterval(timerInterval);
        timeLeft = 60;
        otpExpired = false;
        document.getElementById("otp").disabled = false;
        document.getElementById("signupBtn").disabled = false;
        
        const timerElement = document.getElementById("timer");
        timerElement.style.display = "block";
        timerElement.innerText = "OTP valid for: " + timeLeft + "s";
        timerElement.style.color = "#ff3366";

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                otpExpired = true;
                timerElement.innerText = "OTP expired. Please click 'Send OTP' again.";
                document.getElementById("signupBtn").disabled = true;
                document.getElementById("otp").disabled = true;
            } else {
                timerElement.innerText = "OTP valid for: " + timeLeft + "s";
            }
        }, 1000);

    } catch (error) {

        console.error("Fetch Error:", error);
        alert("Cannot connect to backend server.");

    }
}
async function verifyOTP(){

    if (otpExpired) {
        alert("OTP has expired. Please send a new OTP.");
        return;
    }

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

    if(data.message === "OTP Verified Successfully"){
        clearInterval(timerInterval);
        document.getElementById("timer").innerText = "OTP Verified Successfully!";
        document.getElementById("timer").style.color = "green";
        createAccount();

    }else{

        alert("Wrong OTP");
    }
}

async function createAccount(){

    let name =
    document.getElementById("firstName").value.trim();

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
    "http://localhost:5000/signup",
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