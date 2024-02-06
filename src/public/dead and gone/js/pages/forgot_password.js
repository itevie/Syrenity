document.addEventListener("DOMContentLoaded", () => {
    let element = document.getElementById("action-button");
    element.onsubmit = (e) => {
        e.preventDefault();
        fetch("/api/users/@me/request-password-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: "{}",
        }).then(async (res) => {
            if (!res.ok) {
                return alert("Failed to send email");
            }
            alert("done");
        });
    };
});
export {};
