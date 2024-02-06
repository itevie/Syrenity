import * as general from '../general.js';
document.getElementById("login-form").onsubmit = (e) => {
    e.preventDefault();
    // Set button as loading
    general.setElementLoading(document.getElementById("login-button"), "Logging in...");
    // Obtain details
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Send request
    fetch("/auth/password", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: email,
            password: password,
        })
    }).then(async (res) => {
        general.setElementDoneLoading(document.getElementById("login-button"));
        // Check status
        if (!res.ok) {
            general.alerts.error("Incorrect username or password, try again", "Oops");
        }
        else {
            // Redirect
            location.href = "/";
        }
    });
};
