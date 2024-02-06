interface Coordinate {
  x: number;
  y: number;
}

interface ModalData {
  values?: {[key: string]: string};
  id?: string;
  unique?: boolean;
  fallback?: (message: string) => void;
  handleIDs?: (keys: {[key: string]: HTMLElement}) => void;
  smallModal?: boolean;
}

/**
 * All generic utility functions for the site
 */
const stuff = {
  /**
   * Basic alert functions
   */
  alerts: {
    /**
     * Shows an error modal
     * @param err The error message
     * @param title The error title
     */
    error: (err: string, title: string) => {
      stuff.modals.showModal("error", {
        values: {
          title,
          text: err,
        },
        fallback: () => {
          alert(`${title}: ${err}`);
        }
      });
    },

    confirm: (question: string, data: {title?: string, no?: string, yes?: string, noCb?: Function, yesCb?: Function} = {}) => {
      stuff.modals.showModal("confirm", {
        values: {
          text: question,
          title: data.title ? data.title : "Confirm",
          no: data.no ? data.no : "No",
          yes: data.yes ? data.yes : "Yes",
        },
        handleIDs: (keys) => {
          // Check if there is a yes callback
          if (data.yesCb) {
            keys.yes.onclick = () => {
              data.yesCb();
            }
          }

          // Check if there is a no callback
          if (data.noCb) {
            keys.no.onclick = () => {
              data.noCb();
            }
          }
        }
      });
    }
  },

  /**
   * Modal managers
   */
  modals: {
    /**
     * List of modal names which will automatically use the unique version
     */
    uniqueModals: ["error"],
    knownSmallModals: ["error", "confirm"],

    /**
     * Load and display a modal
     * @param name The name of the modal (/public/modals/xxxxxxxx)
     * @param data The modal data
     * @returns The modal element
     */
    showModal: async (name: string, data: ModalData = { values: {} }) => {
      // Check if it is a known unique
      if (stuff.modals.uniqueModals.includes(name))
        data.unique = true;

      // Check if it should not be big
      if (stuff.modals.knownSmallModals.includes(name))
        data.smallModal = true;

      // Check if it OK
      if (!data.values) data.values = {};
      if (!data.smallModal) data.smallModal = false;

      try {
        // Fetch the modal data
        const modalData = await fetch(`/public/modals/${name}.html`, {
          method: "GET",
          mode: "no-cors"
        });

        // Check if it was OK
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

        // Set the preset values
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
        if (!data.smallModal) modalDiv.classList.add("big-modal");
        modalDiv.innerHTML = html;
        container.appendChild(modalDiv);
  
        // Find data-hide-modal
        const hiders = div.querySelectorAll("[data-modal-hide]") as NodeListOf<HTMLInputElement>;
        for (const i of hiders) {
          i.addEventListener("click", () => {
            stuff.modals.hideModal(id);
          });
        }

        // Check if there is data-hide-id's
        const ids = div.querySelectorAll("[data-modal-id]") as NodeListOf<HTMLInputElement>;
        const elemIDs: {[key: string]: HTMLElement} = {};
        for (const i of ids) {
          elemIDs[i.getAttribute("data-modal-id")] = i;
        }

        // Check if the options listen for this
        if (data.handleIDs) {
          data.handleIDs(elemIDs);
        }

        // Check for data-modal-upload-pfp
        const uploadPfps = div.querySelectorAll("[data-modal-upload-pfp]") as NodeListOf<HTMLImageElement>;
        for (const uploader of uploadPfps) {
          // Listen for onclick
          uploader.onclick = async () => {
            let data = await stuff.images.getFromComputer();
            if (data !== null) {
              uploader.src = data;
              uploader.setAttribute(`data-modal-upload-success`, "true");
            }
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

    /**
     * Hides a modal with a name or the ID of the modal
     * @param name Name of the modal or ID of container
     */
    hideModal(name: string) {
      // Find the modal
      let modalElement = document.getElementById(`modal-${name}`)
        || document.getElementById(name);

      // Remove the modal
      modalElement.parentNode.removeChild(modalElement);
    }
  },

  /**
   * Stuff to do with coordinates on the screen
   */
  coordinates: {
    /**
     * Returns the X, Y coordinates of an element based of the the css top and left
     * @param element The element to get the coordinates for
     * @returns The coordinate of the element
     */
    getFor: (element: HTMLElement): Coordinate => {
      // I don't know what any of this does, I stole it from somewhere
      const box = element.getBoundingClientRect();

      const body = document.body;
      const docEl = document.documentElement;

      const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

      const clientTop = docEl.clientTop || body.clientTop || 0;
      const clientLeft = docEl.clientLeft || body.clientLeft || 0;

      const top  = box.top +  scrollTop - clientTop;
      const left = box.left + scrollLeft - clientLeft;

      return { y: Math.round(top), x: Math.round(left) };
    },

    /**
     * Bounds a coordinate to the window width & height meaning it will not be able to overflow
     * @param x Coordinate X
     * @param y Coordinate Y
     * @param element The element to bound
     * @returns The bounded coordinate
     */
    bound: (x: number, y: number, element: HTMLElement): Coordinate => {
      const sizeW = element.offsetWidth;
      const sizeH = element.offsetHeight;
      const padding = 20;

      // Check if they go out of bounds

      // OOB right
      if (x + padding + sizeW > window.innerWidth)
        x = window.innerWidth - sizeW - padding;

      // OOB bottom
      if (y + padding + sizeH > window.innerHeight)
        y = window.innerHeight - sizeH - padding;

      return {x, y};
    },

    /**
     * Checks if given X Y coordinates are inside an element
     * @param x The X coordinate
     * @param y The Y coordinate
     * @param element The element to check
     * @returns True or false whether the element contains the coordinates
     */
    in: (x: number, y: number, element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();

      return (
        x > rect.x &&
        y > rect.y &&
        x < rect.x + element.offsetWidth &&
        y < rect.y + element.offsetHeight
      );
    }
  },

  avatar: {
    colors: [
      "#ED4245", "#22943a", "#E0A800", "#5865F2", "#FFB6C1"
    ],

    setNoAvatarIcon: (userId: number, element: HTMLImageElement) => {
      element.style.backgroundColor = stuff.avatar.colors[Math.floor(stuff.seededRandom(userId) * stuff.avatar.colors.length)];
      element.src = "/public/images/logos/no_shape_logo.png";
      return stuff.avatar.colors[Math.floor(stuff.seededRandom(userId) * stuff.avatar.colors.length)];
    }
  },

  /**
   * 
   * @copyright https://stackoverflow.com/a/19303725/20022509
   * @param {number} seed The seed
   * @returns {number} The result
   */
  seededRandom: (seed: number): number => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  },

  time: {
    units: {
      day: 8.64e+7
    },

    getRelativeString: (date: Date) => {
      // Check if it was today
      if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
        // Return as "Today at xx:xx"
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } 
      
      // Check if it was yesterday
      else if (date.getDate() == new Date().getDate() - 1 && date.getMonth() == new Date().getMonth() && date.getFullYear() == new Date().getFullYear()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }

      // Default
      else {
        return `${date.toLocaleString()}`;
      }
    }
  },

  images: {
    getFromComputer: (): Promise<string | null> => {
      return new Promise<string | null>((resolve) => {
        
        // Create input element
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = a => {
          let gfile = input.files[0];
    
          if (gfile.type.startsWith("image/") == false) {
              return stuff.alerts.error("Please select an image file! .png .jpg etc.", "Invalid file!");
          }
    
          const reader = new FileReader();
    
          reader.onload = readFile => {
            stuff.alerts.confirm(`Are you sure you want to upload this file? At the moment, all images uploaded are uploaded to imgur.`, {
              title: "Confirm Upload",
              yesCb: () => {
                let b64 = stuff.arrayBufferToBase64(readFile.target.result)
                console.log(gfile.type);
                resolve(`data:${gfile.type};base64,${b64}`);
              },
              noCb: () => {
                resolve(null);
              }
            });
          }
    
          reader.readAsArrayBuffer(gfile);
        }
    
        input.click();
      });
    }
  },

  arrayBufferToBase64: (buffer) => {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  },

  dataDivs: {
    registerGroup: (groupName: string): void => {
      // Get all the group showers
      const showerElements = document.querySelectorAll(`[data-div-group="${groupName}"][data-div-group-show]`);
      let showers: {[key: string]: HTMLElement} = {};

      for (const element of showerElements) {
        const id = element.getAttribute("data-div-group-show");
        showers[id] = element as HTMLElement;
      }

      // Get all the ids
      const idElements = document.querySelectorAll(`[data-div-group=${groupName}][data-div-group-id]`);
      let ids: {[key: string]: HTMLElement} = {};

      for (const element of idElements) {
        const id = element.getAttribute("data-div-group-id");
        ids[id] = element as HTMLElement;
      }

      function hideAll() {
        for (const i in ids) {
          console.log(ids[i]);
          ids[i].style.display = "none";
        }
      }

      // Loop through all the showers and listen for click
      for (const i in showers) {
        showers[i].addEventListener("click", () => {
          console.log("hi")
          hideAll();
          ids[i].style.display = "block";
        });
      }

      // Defaults
      hideAll();
      const def = document.querySelector(`[data-div-group=${groupName}][data-div-group-default]`);
      if (def) (def as HTMLElement).style.display = "block";
    }
  }
}

export default stuff;