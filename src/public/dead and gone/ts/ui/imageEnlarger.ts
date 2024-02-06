import general from "../general_new.js"

// Register the enlarged image container
document.addEventListener("DOMContentLoaded", () => {
  // Add base element
  const div = document.createElement("div");
  div.classList.add("image-expanded-backdrop");
  div.id = `image-expanded-backdrop`;

  // Add image
  const img = document.createElement("img");
  img.classList.add("image-expanded-image");
  img.id = "image-expanded-image";
  div.appendChild(img);

  // Add open image
  const open = document.createElement("label");
  open.innerHTML = "Loading image...";
  open.classList.add("image-expanded-open");
  open.id = "image-expanded-open";
  div.appendChild(open);
  
  // Hide the enlarged image on click
  div.addEventListener("click", (e) => {
    // Check if click in image
    if (general.coordinates.in(e.clientX, e.clientY, img))
      return;
    (document.getElementById("image-expanded-image") as HTMLImageElement).src = "/public/images/logos/no_shape_logo.png";
    div.style.display = "none";
    open.style.display = "block";
  });

  document.body.appendChild(div);
});

/**
 * Enlarges an image on the screen
 * @param src The source of the image
 */
export default function enlargeImage(src: string) {
  (document.getElementById("image-expanded-image") as HTMLImageElement).src = src;
  document.getElementById("image-expanded-backdrop").style.display = "block";

  document.getElementById("image-expanded-image").onload = () => {
    document.getElementById("image-expanded-open").style.display = "none";
  }
}