import { useEffect, useState } from "react";
import { setFullscreenImage } from "./ImageViewer";
import showImageContextMenu from "./context-menus/imageContextMenu";
import { fallbackImage } from "../config";

interface MessageImageAttachmentProps {
  url: string;
  onClick: (url: string) => void;
  onLoad: (amount: number) => void;
}

export default function MessageImageAttachment({
  url,
  onClick,
  onLoad,
}: MessageImageAttachmentProps) {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  return (
    <div className="sy-attachment-image">
      {!hasLoaded && <img src={fallbackImage} alt="Loading..." />}
      <img
        onLoad={(e) => {
          setHasLoaded(true);
          setTimeout(() => {
            onLoad(
              (e.target as HTMLImageElement).getBoundingClientRect().height
            );
          }, 100);
        }}
        className="sy-attachment-image"
        src={url}
        onClick={() => onClick(url)}
        onContextMenu={(e) => showImageContextMenu(e, url)}
        style={{ display: hasLoaded ? "block" : "none" }}
      />
    </div>
  );
}
