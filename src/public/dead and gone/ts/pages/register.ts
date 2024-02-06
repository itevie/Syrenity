import general from '../general_new.js';

// Words for suggesting
const nouns = [
  "dog", "cat", "fridgerator", "bean", "pupppy",
  "carrot", "jellybean", "rainbow", "soybean", "phone",
  "waterbottle", "oven", "tic-tac-toe_master",
  "lemonade", "chocolate", "chocolate_bar", "donut",
  "person", "human", "pillow", "plushie", "apple",
  "banana", "gamer", "archaeologist", "anthropologist",
  "gigachad"
];

const verbs = [
  "walking", "running", "sleeping", "loving", "hating", "glowing", "shining", "gaming",
];

const adjectives = [
  "magical", "quiet", "awesome", "overrated", "underrated", "ultimate",
  "remarkable", "unbelieveable", "outstanding", "abundant", "under_the_weather",
  "happy", "sad", "angry", "bad"
];

function generateUsername() {
  let username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}`

  if (Math.random() > 0.5) username += `${verbs[Math.floor(Math.random() * verbs.length)]}`;

  username += `${nouns[Math.floor(Math.random() * nouns.length)]}`;

  let amount = Math.floor(Math.random() * 5);
  for (let i = 0; i != amount; i++)
    username += Math.floor(Math.random() * 9);

  return username;
}

let gigachadEasterEggplaying = false

document.addEventListener("DOMContentLoaded", () => {
  const username = (document.getElementById("username") as HTMLInputElement);
  document.getElementById("username-reroll").addEventListener("click", () => {
    username.value = generateUsername();
    
    // Check for gigachad
    checkForGigachad();
  });

  username.addEventListener("keydown", () => {
    checkForGigachad();
  });

  username.placeholder = generateUsername();
  checkForGigachad();

  // Listening for the form
  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister();
  });
});

function checkForGigachad() {
  const username = (document.getElementById("username") as HTMLInputElement);

  // Check for gigachad
  if ((username.value.includes("gigachad") || username.placeholder.includes("gigachad")) && gigachadEasterEggplaying == false) {
    gigachadEasterEggplaying = true;
    // Hijack the container (with gigachad)
    document.body.style["backgroundImage"] = "url(https://media.tenor.com/epNMHGvRyHcAAAAd/gigachad-chad.gif)";
    document.getElementById("container").style["backgroundImage"] = "url(https://media.tenor.com/epNMHGvRyHcAAAAd/gigachad-chad.gif)";
    document.getElementById("register-form").style["backgroundImage"] = "url(https://media.tenor.com/epNMHGvRyHcAAAAd/gigachad-chad.gif)";
    (document.getElementById("register-icon") as HTMLImageElement).src = "https://media.tenor.com/epNMHGvRyHcAAAAd/gigachad-chad.gif";

    // Play audio (gigachad)
    let gigachadness = new Audio("/public/audio/gigachad.mp3");
    gigachadness.volume = 0.2;
    gigachadness.play();
  }
}

function clearErrors() {
  let errors = ["email", "username", "password", "confirm"];
  
  for (const error of errors) {
    document.getElementById(`${error}-error`).innerHTML = "";
  }
}

function showError(f: string, error: string) {
  document.getElementById(`${f}-error`).innerHTML = error;
}

function handleRegister() {
  clearErrors();

  // Obtain details
  const username = document.getElementById("username") as HTMLInputElement;
  const email = document.getElementById("email") as HTMLInputElement;
  const password = document.getElementById("password") as HTMLInputElement;
  const confirm = document.getElementById("confirm") as HTMLInputElement;

  // Basic stuff
  if (confirm.value != password.value)
    return showError("confirm", "Passwords do not match");

  // Validate email
  if (!email.value.match(/[a-z0-9-_\.]+@([a-z0-9-_]+)|\.([a-z0-9-_]+)/))
    return showError("email", "This is not a valid email address");

  // Send request
  fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value,
    })
  }).then(async res => {
    if (!res.ok) {
      const text = await res.text();
      const json = JSON.parse(text);

      // Check for multiple errors
      if (json.errors) {
        for (let i in json.errors) {
          showError(json.errors[i].at, json.errors[i].message);
        }
      } 
      
      // Check for individual error
      else if (json.at && json.message) {
        showError(json.at, json.message);
      } 
      
      // Otherwise show an unknown error
      else {
        general.alerts.error(`An unknown error occurred: ${JSON.stringify(json)} (${res.status})`, "Failed to register");
      }

      return;
    }

    location.href = "/login";
  })
}