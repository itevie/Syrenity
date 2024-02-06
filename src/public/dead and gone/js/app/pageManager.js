import general from '../general_new.js';
export async function showPage(name) {
    try {
        // Try fetch the page
        const pageData = await fetch(`/public/pages/${name}.html`);
        // Check if it was ok
        if (!pageData.ok) {
            general.alerts.error(`We couldn't load that page for you! Sorry about that, maybe try in a few minutes?`, "Oops");
            return null;
        }
        const pageText = await pageData.text();
        // Construct div
        const container = document.createElement("div");
        container.classList.add("page");
        // Add data
        container.innerHTML = pageText;
        // Add close button
        const close = document.createElement("button");
        close.classList.add("page-close");
        close.innerHTML = "Close";
        container.appendChild(close);
        close.onclick = () => {
            document.getElementById("page-container").removeChild(container);
            document.getElementById("page-container").style.display = "none";
        };
        // Add to document
        document.getElementById("page-container").appendChild(container);
        document.getElementById("page-container").style.display = "block";
        const element = container.querySelectorAll("[data-page-element-id]");
        const elements = {};
        for (const elem of element) {
            elements[elem.getAttribute("data-page-element-id")] = elem;
        }
        // Return
        return {
            element: container,
            elements
        };
    }
    catch (err) {
        alert(err);
    }
}
