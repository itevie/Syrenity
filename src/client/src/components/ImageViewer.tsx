import { useEffect, useState } from "react";
import showImageContextMenu from "../context-menus/imageContextMenu";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import Button from "../dawn-ui/components/Button";

export let setFullscreenImage: (
  image: string,
  images: string[]
) => void = () => {};

export default function ImageViewer() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    setFullscreenImage = (image, images) => {
      setImages(images);
      setIndex(images.indexOf(image));
    };
  }, []);

  return images.length > 0 ? (
    <div
      className="dawn-fullscreen"
      onClick={(e) => !(e.target instanceof HTMLButtonElement) && setImages([])}
    >
      <div
        className="dawn-page-center"
        onClick={(e) =>
          !(e.target instanceof HTMLButtonElement) && setImages([])
        }
      >
        <Column util={["justify-center", "align-center"]}>
          <img
            className="sy-image-fullscreen"
            src={images[index] ?? ""}
            onContextMenu={(e) => showImageContextMenu(e, images[index])}
          />
          {images.length > 1 && (
            <Row util={["justify-center"]}>
              <Button
                style={{ fontSize: "2em" }}
                onClick={() =>
                  setIndex(index === 0 ? images.length - 1 : index - 1)
                }
              >
                ←
              </Button>
              <Button
                style={{ fontSize: "2em" }}
                onClick={() =>
                  setIndex(index === images.length - 1 ? 0 : index + 1)
                }
              >
                →
              </Button>
            </Row>
          )}
        </Column>
      </div>
    </div>
  ) : (
    <></>
  );
}
