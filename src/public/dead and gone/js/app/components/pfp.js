import general from "../../general_new.js";
import { showUserDiv } from "../app.js";
export default function GeneratePfp(user) {
    const pfp = document.createElement("img");
    pfp.classList.add("message-pfp");
    pfp.classList.add("base-image");
    pfp.src = user.avatar;
    pfp.onerror = () => general.avatar.setNoAvatarIcon(user.id, pfp);
    pfp.onclick = () => showUserDiv(user, pfp);
    return pfp;
}
