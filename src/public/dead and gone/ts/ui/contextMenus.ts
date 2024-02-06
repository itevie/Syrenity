import general from '../general_new.js';

/**
 * The options for the context menu
 */
interface ContextMenuDetails {
  /**
   * The element to attach the context menu too
   */
  attachTo: HTMLElement;

  /**
   * CSS Selectors to NOT show the context for
   */
  not?: string[];
  
  /**
   * Whether or not primary click should show the context menu
   */
  recordPrimaryMouse?: boolean;

  /**
   * Whether or not it should overwrite existing context menus for the current element
   */
  overwrite?: boolean;

  /**
   * The elements for the context menu
   */
  items: ContextMenuSegment[];

  /**
   * Which direction the conext menu should fly out once it appears
   */
  flyout?: "left" | "right" | "up" | "down";
}

/**
 * A context menu item
 */
interface ContextMenuSegment {
  type?: 'button' | 'seperator';
  content?: string;
  disabled?: boolean;
  danger?: boolean;
  icon?: "warning" | "refresh" | "delete" | 
    "link" | "copy" | "settings" | "edit" | 
    "report" | "leave" | "expand" | "pin" | 
    "edit" | "person_remove" | "download";
  click?: (callback: ContextMenuCallback) => void;
  shiftClick?: () => void;
  clickAction?: "copy" | "link";
  clickActionContent?: string;
  checked?: boolean;
  hide?: boolean;
  hideOnClick?: boolean;
}

/**
 * The data returned for click events for managing the context menu
 */
interface ContextMenuCallback {
  /**
   * Updates some states of the context menu
   * @param details The details to update for the item
   */
  updateState: (details: ContextMenuSegment) => void;
  close: () => void;
}

const iconMap: {[key: string]: string} = {
  link: "open_in_new",
  copy: "content_copy",
  report: "flag",
  leave: "logout",
  expand: "open_in_full",
  pin: "push_pin"
}

let contextContainer: HTMLElement | null = null;

// Add the context container to the document
document.addEventListener("DOMContentLoaded", () => {
  // Create container
  const container = document.createElement("div");
  contextContainer = container;
  container.classList.add("context-container");

  // Add to document
  document.body.appendChild(container);
}); 

/**
 * Registers a context menu for an element
 * @param data The data for the context menu
 */
export function registerContextMenu(data: ContextMenuDetails) {
  // Register right click event
  data.attachTo.addEventListener("contextmenu", (e) => {
    // Check for not's
    console.log(e.target, data.not);
    if (data.not) {
      for (const not of data.not) {
        if ((e.target as HTMLElement).matches(not)) {
          return;
        }
      }
    }

    e.preventDefault();
    showContextMenu(data.attachTo, data, e);
  });

  // Listen for clicks
  document.addEventListener("click", (e) => {
    // Check if it should show the context menu for the primary click
    if (data.recordPrimaryMouse && contextContainer.style.display === "none") {
      // Check if the element is in the element
      if (general.coordinates.in(e.x, e.y, data.attachTo)) {
        setTimeout(() => {
          e.preventDefault();
          showContextMenu(data.attachTo, data, e);
        }, 50);
      }
      return;
    }

    // Check if click was not in the bounds of the context menu
    if (!general.coordinates.in(e.clientX, e.clientY, contextContainer)) {
      contextContainer.style.display = "none";
    }
  });
}

/**
 * Shows a context menu for the given element
 * @param element The HTML element to show the context menu on
 * @param contextMenu The details for the context menu
 * @param event The mouse click event
 */
function showContextMenu(element: HTMLElement, contextMenu: ContextMenuDetails, event: MouseEvent = null) {
  // Get the coordinates of the element
  let coordinates = event ? { x: event.clientX, y: event.clientY } : general.coordinates.getFor(element);

  // Clear current context menu
  contextContainer.innerHTML = "";

  contextContainer.style.display = "block";

  // Add items
  let prevType = null;
  for (const i in contextMenu.items) {
    const item = contextMenu.items[i];

    // Check if it is a sperator and should be ignored
    if (
      item.type == "seperator" && 
      (
        prevType == null ||
        prevType == "seperator" || 
        +i == contextMenu.items.length - 1
      )
    )
      continue;

    // Check if it is hidden
    if (item.hide) continue;

    prevType = item.type || "button";
    
    // Check if it is a seperator, if so do it differently
    if (item.type == "seperator") {
      const contextItem = document.createElement("hr");
      contextContainer.appendChild(contextItem);
      continue;
    }
    
    // Create item - base
    const contextItem = document.createElement("div");
    contextItem.classList.add("context-item");

    const contextItemContent = document.createElement("label");
    contextItemContent.innerHTML = item.content;
    contextItem.appendChild(contextItemContent);

    // Check for dangerous
    if (item.danger) {
      contextItem.classList.add("context-danger");
    }

    // Check for disabled
    if (item.disabled) {
      contextItem.classList.add("context-disabled");
    }

    // Check for icon
    if (item.icon) {
      // Construct icon
      const icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined");
      icon.classList.add("context-icon");
      icon.innerHTML = iconMap[item.icon] || item.icon;

      contextItem.appendChild(icon);
    }

    // Check for onclick
    contextItem.addEventListener("click", (e) => {
      // Check if there is a shift click
      if (e.shiftKey && item.shiftClick && !item.disabled) {
        item.shiftClick();
      }
      
      // Check if the item has a click listener
      else if (item.click && !item.disabled) {
        item.click({
          updateState: (details) => {
            if (details.content)
            contextItemContent.innerHTML = details.content;
          },
          close: () => {
            contextContainer.style.display = "none";
          }
        });
      }

      // Check if it should hide on click
      if (item.hideOnClick || !Object.prototype.hasOwnProperty.call(item, "hideOnClick")) {
        contextContainer.style.display = "none";
      }
    });

    contextContainer.appendChild(contextItem);
  }

  coordinates = general.coordinates.bound(coordinates.x, coordinates.y, contextContainer);

  contextContainer.style.top = coordinates.y + "px";
  contextContainer.style.left = coordinates.x + "px";
}