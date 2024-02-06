import general from '../general_new.js';
const backMessages = [
    "Go home", `Say "No, thanks!"`, `I have too many friends`
];
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("back").innerHTML = backMessages[Math.floor(Math.random() * backMessages.length)];
    // Listen for on join
    document.getElementById("join").onclick = () => {
        let invite = document.getElementById(`invite_code`).innerHTML;
        let guild = document.getElementById(`guild_id`).innerHTML;
        fetch(`/api/invites/${invite}`, {
            method: "POST"
        }).then(async (res) => {
            if (!res.ok) {
                return general.alerts.error(`Failed to join server! ${await res.text()}`, "Ooops");
            }
            location.href = `/channels/${guild}`;
        });
    };
});
