export function updateUI() {
  // Set the accent color
  if (localStorage.getItem("accent-color")) {
    let color = localStorage.getItem("accent-color");
    let colorDark = LightenDarkenColor(color, -20);

    document.body.style.setProperty("--color-accent-0", color);
    document.body.style.setProperty("--color-popup-backdrop", color);
    document.body.style.setProperty("--color-accent-dim-0", colorDark);
    document.body.style.setProperty("--color-tag", colorDark);
  }
}

function LightenDarkenColor(col, amt) {
  
  var usePound = false;

  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }

  var num = parseInt(col,16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

}