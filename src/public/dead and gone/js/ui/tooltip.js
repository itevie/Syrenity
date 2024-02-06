import { getCoords } from "../general.js";
import general from '../general_new.js';
// Add the tooltip div to the document
(() => {
    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add("tooltip-container");
    tooltipDiv.innerHTML = "This is a tooltip!";
    tooltipDiv.id = "tooltip-container";
    document.body.appendChild(tooltipDiv);
})();
const tooltips = new Map();
let activeTooltip = null;
/**
 * Registers a tooltip listener for an element
 * @param details The settings for the tooltip
 */
export function registerTooltip(details) {
    // Register tooltip
    tooltips[details.attachTo.id] = details;
    let isIn = false;
    // Register events
    details.attachTo.addEventListener("mouseenter", (e) => {
        isIn = true;
        if (details.hoverFor) {
            setTimeout(() => {
                if (isIn) {
                    showTooltip(details, e);
                    activeTooltip = details.attachTo;
                }
            }, details.hoverFor);
        }
        else {
            showTooltip(details, e);
            activeTooltip = details.attachTo;
        }
    });
    details.attachTo.addEventListener("mouseleave", () => {
        isIn = false;
        // Check if it is on another div by now
        if (activeTooltip == details.attachTo) {
            const tooltipContainer = document.getElementById("tooltip-container");
            tooltipContainer.style.display = "none";
            activeTooltip = null;
        }
    });
}
/**
 * Resets the tooltip container, such as removing all the animations
 */
function resetTooltip() {
    const tooltipContainer = document.getElementById("tooltip-container");
    tooltipContainer.classList.remove("tooltip-flyout-right");
    tooltipContainer.classList.remove("tooltip-flyout-down");
    tooltipContainer.classList.remove("tooltip-flyout-top");
}
/**
 * Shows a tooltip for an element
 * @param details The details for the element
 * @param event The mouse event
 */
function showTooltip(details, event) {
    resetTooltip();
    const tooltipContainer = document.getElementById("tooltip-container");
    tooltipContainer.style.display = "block";
    if (!details.flyout)
        details.flyout = "right";
    // Get location of the div
    let coords = getCoords(details.attachTo);
    // Check offset
    if (details.flyout === 'right') {
        coords.left += details.attachTo.offsetWidth;
        tooltipContainer.classList.add("tooltip-flyout-right");
    }
    else if (details.flyout === "down") {
        coords.top += details.attachTo.offsetHeight;
        tooltipContainer.classList.add("tooltip-flyout-down");
    }
    else if (details.flyout === "top") {
        coords.top -= details.attachTo.offsetHeight + tooltipContainer.offsetHeight;
        tooltipContainer.classList.add("tooltip-flyout-top");
    }
    if (details.followMouseX) {
        coords.left = event.clientX - (tooltipContainer.offsetWidth / 2);
    }
    if (coords.left < 0)
        coords.left = 0;
    if (details.exactMouse) {
        coords = { top: event.clientY, left: event.clientX };
    }
    let newCoords = general.coordinates.bound(coords.left, coords.top, tooltipContainer);
    // Update location
    tooltipContainer.style.left = newCoords.x + "px";
    tooltipContainer.style.top = newCoords.y + "px";
    // Set content
    tooltipContainer.innerHTML = details.content;
}
/**
 * Load all the elements that have data-tooltip-x and register them
 */
export function loadAll() {
    // Get ones that have the data-tooltip-content
    const contents = document.querySelectorAll("[data-tooltip-content]");
    for (const element of contents) {
        // Check for other things
        const flyout = element.getAttribute("data-tooltip-flyout");
        const content = element.getAttribute("data-tooltip-content");
        // Load it
        registerTooltip({
            attachTo: element,
            flyout: flyout,
            content,
        });
    }
}
