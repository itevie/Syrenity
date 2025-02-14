import { isAxiosError } from "axios";
import { showErrorAlert } from "./dawn-ui/components/AlertManager";
import { defaultLogger } from "./dawn-ui/Logger";

export function generateAvatar(
  text: string,
  foregroundColor = "white",
  backgroundColor = "#00000000"
) {
  // Check length
  if (text.length > 2) {
    text = text.substring(0, 2);
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.width = 200;
  canvas.height = 200;

  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  context.font = "bold 100px Arial";
  context.fillStyle = foregroundColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}

export function handleClientError(what: string, error: any) {
  defaultLogger.error(`Failed to ${what}`, error);
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        showErrorAlert(`You do not have permission to ${what}`);
        break;
      default:
        const message = error.response?.data?.error?.message ?? "Unknown Error";
        showErrorAlert(`${message}`, `Failed to ${what}`);
    }
  }
}

export type Err<E> = {
  type: "err";
  v: E;
};

export type Ok<T> = {
  type: "ok";
  v: T;
};

export type Result<T, E> = Ok<T> | Err<E>;

export async function wrap<T, E = any>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    return {
      type: "ok",
      v: await promise,
    };
  } catch (e) {
    return {
      type: "err",
      v: e as E,
    };
  }
}

export function isErr<T, E>(value: Result<T, E>): value is Err<E> {
  return value.type === "err";
}

export function isOk<T, E>(value: Result<T, E>): value is Ok<T> {
  return value.type === "ok";
}
