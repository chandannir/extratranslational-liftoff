"""
Install: pip install -r requirements.txt
Quit: press 'q' or Escape, or close the preview window.
"""

import sys

import cv2
from ultralytics import YOLO

DEFAULT_MODEL = "yolov8n.pt"
# COCO pretrained models include "bottle". Change or add names if you use a custom model.
DETECT_ONLY = ("bottle","person")


def class_ids_for_labels(model: YOLO, labels: tuple[str, ...]) -> list[int]:
    # map class names to their numeric IDs for the model, so we can filter by name
    name_to_id = {name: int(i) for i, name in model.names.items()}
    out: list[int] = []
    for label in labels:
        if label not in name_to_id:
            available = ", ".join(sorted(name_to_id))
            raise ValueError(f"Unknown class {label!r}. This model has: {available}")
        out.append(name_to_id[label])
    return out


def open_camera(index: int = 0) -> cv2.VideoCapture:
    # On Windows, DirectShow often opens faster and more reliably.
    if sys.platform == "win32":
        cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open camera {index}. Check that the device is connected "
            "and not used by another app; try index 1 if you have multiple cameras."
        )
    return cap


def main() -> None:
    model = YOLO(DEFAULT_MODEL)
    bottle_only = class_ids_for_labels(model, DETECT_ONLY)
    cap = open_camera(0)
    window = "cam"

    try:
        while True:
            ok, frame = cap.read()
            if not ok or frame is None:
                print("Frame grab failed; exiting.")
                break

            results = model.predict(frame, classes=bottle_only, verbose=False)
            annotated = results[0].plot()

            cv2.imshow(window, annotated)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q"), 27):  # q or Esc
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
