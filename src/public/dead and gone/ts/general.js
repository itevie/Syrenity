// For removing flashes when loading
let oldBackgroundColor = document.body.style["backgroundColor"];
document.body.style["backgroundColor"] = "black";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.body.style["backgroundColor"] = oldBackgroundColor;
  }, 100);
})

/**
 * Marks an element as loading by showing a loading text and disabling it
 * @param {Element} element The element
 * @param {string} customText Custom text for the div
 */
export function setElementLoading(element, customText = "Loading...") {
  if (element.tagName == "INPUT") {
    const oldText = element.value;
    element.setAttribute("data-old-innerHTML", oldText);
    element.value = customText;
  } else {
    // Get the old
    const oldText = element.innerHTML;

    // Set old prop
    element.setAttribute("data-old-innerHTML", oldText);

    // Set inner
    element.innerHTML = customText;
  }
  
  element.disabled = true;
}

/**
 * Retrieves the original inner HTML of the element and marks it as enabled
 * @param {Element} element The element
 */
export function setElementDoneLoading(element) {
  // Get the old
  const oldText = element.getAttribute("data-old-innerHTML") || "Oops...";

  if (element.tagName == "INPUT") {
    element.value = oldText
  }
  else element.innerHTML = oldText;
  element.disabled = false;
}

const alerts = {
  error: (err, title) => {
    modals.showModal("error", {
      values: {
        title: title,
        text: err
      },
      fallback: () => {
        alert(`${title}: ${err}`);
      }
    });
  }
};

const modals = {
  /**
   * List of known modals which are unique and therefore don't need to be in the data param
   */
  knownUniqueModals: [ "error", "please_wait" ],

  /**
   * Shows a modal
   * @param {string} name The name of the modal to lookup 
   * @param {object} data The data
   * @param {object} data.values The values to provide (%example%)
   * @param {Function} data.fallback The fallback function if it fails to find the modal
   * @param {number} data.id The ID the div will have
   * @param {boolean} data.unique Whether or not the auto generated ID should be unique
   * @returns {HTMLElement} The created modal div
   */
  showModal: async (name, data = { values: {} }) => {
    // Check if it is known unique
    if (modals.knownUniqueModals.includes(name))
      data.unique = true;

    try {
      const modalData = await fetch(`/public/modals/${name}.html`, {
        method: "GET",
        mode: "no-cors"
      });

      // Check if it was ok
      if (!modalData.ok) {
        // Check if there was a fallback
        if (data.fallback) {
          return data.fallback(`Failed to fetch modal ${name}`);
        } else {
          throw new Error(`Failed to fetch modal ${name}`);
        }
      }

      // Get the HTML
      let html = await modalData.text();

      // Generate ID
      const id = data.id || (data.unique ? `modal-${name}-${Math.random()}` : `modal-${name}`);

      // Check if ID already exists
      if (document.getElementById(id))
        document.getElementById(id).parentNode.removeChild(document.getElementById(id));

      // Preset values
      data.values.id = id;
      
      // Modify HTML
      if (data.values) {
        for (const i in data.values) {
          const regex = new RegExp(`%${i}%`, "g");
          
          // Replace
          html = html.replace(regex, data.values[i]?.trim());
        }
      }

      // Construct the div
      const div = document.createElement("div");
      div.id = id;

      // Add the blindfold
      const blindfold = document.createElement("div");
      div.classList.add("intrusive-modal");
      div.appendChild(blindfold);

      // Add the container
      const container = document.createElement("div");
      container.classList.add("modal-container");
      div.appendChild(container);

      // Add the modal
      const modalDiv = document.createElement("div");
      modalDiv.classList.add("modal");
      modalDiv.innerHTML = html;
      container.appendChild(modalDiv);

      // Find data-hide-modal
      const hiders = div.querySelectorAll("[data-hide-modal]");
      for (const i of hiders) {
        i.onclick = () => {
          modals.hideModal(id);
        }
      }

      // Done, add it to document
      document.body.appendChild(div);
    } catch (err) {
      console.log(err);

      // Check if there was a fallback
      if (data.fallback) {
        return data.fallback(`Failed to fetch modal ${name}`);
      } else {
        throw new Error(`Failed to fetch modal ${name}`);
      }
    }
  },

  hideModal(name) {
    // Find the modal
    let modalElement = document.getElementById(`modal-${name}`)
      || document.getElementById(name);

    // Remove the modal
    modalElement.parentNode.removeChild(modalElement);
  }
};

export {modals, alerts};


function convertStringToInitals(string) {
  let words = string.split(" ");
  let result = "";

  for (let i in words) {
    result += words[i][0];
  }

  return result;
}

/**
 * Converts an avatar to an intial avatar
 * @copyright Stolen from https://github.com/musebe/Avatars-JavaScript
 * @param {string} text The text to get the initials of
 * @param {string} foregroundColor The foreground color
 * @param {string} backgroundColor The background color 
 * @returns 
 */
function generateAvatar(
  text,
  foregroundColor = "white",
  backgroundColor = "#00000000"
) {
  // Check length
  if (text.length > 2) {
    text = text.substring(0, 2);
  }

  const canvas = document.createElement("canvas");
  //download = document.getElementById("download");
  const context = canvas.getContext("2d");

  canvas.width = 200;
  canvas.height = 200;

  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  context.font = "bold 100px Arial";
  context.fillStyle = foregroundColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2 );
  return canvas.toDataURL("image/png");
}

export {
  convertStringToInitals,
  generateAvatar
};

/**
 * Function to get coords (stole from StackOverflow)
 * @param {HTMLElement} elem 
 * @returns {object} Top & left
 */
function getCoords(elem) {
  var box = elem.getBoundingClientRect();

  var body = document.body;
  var docEl = document.documentElement;

  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;

  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

function clampCoords(x, y) {
  if (x < 0) x = 0;
  if (y < 0) y = 0;

  return { left: x, top: y };
}

export {getCoords};