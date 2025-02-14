import { useEffect, useState } from "react";
import { setFullscreenImage } from "./ImageViewer";
import showImageContextMenu from "../context-menus-alerts/imageContextMenu";

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
      {!hasLoaded && (
        <img src="/public/images/logos/no_shape_logo.png" alt="Loading..." />
      )}
      <img
        onLoad={(e) => {
          setHasLoaded(true);
          /*setTimeout(() => {
            console.log((e.target as HTMLImageElement).getBoundingClientRect());
            onLoad(
              (e.target as HTMLImageElement).getBoundingClientRect().height
            );
          }, 100);*/
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
