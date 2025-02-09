import { useEffect, useState } from "react";
import { setFullscreenImage } from "./ImageViewer";
import showImageContextMenu from "../context-menus/imageContextMenu";

interface MessageImageAttachmentProps {
  url: string;
  onClick: (url: string) => void;
}

export default function MessageImageAttachment({
  url,
  onClick,
}: MessageImageAttachmentProps) {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  return (
    <div className="sy-attachment-image">
      {!hasLoaded && (
        <img src="/public/images/logos/no_shape_logo.png" alt="Loading..." />
      )}
      <img
        onLoad={() => setHasLoaded(true)}
        className="sy-attachment-image"
        src={url}
        onClick={() => onClick(url)}
        onContextMenu={(e) => showImageContextMenu(e, url)}
        style={{ display: hasLoaded ? "block" : "none" }}
      />
    </div>
  );
}
