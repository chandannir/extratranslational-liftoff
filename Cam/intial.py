"""
Open the default webcam and show a live preview.
Quit: press 'q' or Escape, or close the preview window.
"""

import sys
from tkinter.filedialog import Open

import cv2


def open_camera(index: int = 0) -> cv2.VideoCapture:
    #Open a camera by index. On Windows, DirectShow often opens faster and more reliably
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
    cap = open_camera(0)
    window = "Camera preview"

    try:
        while True:
            ok, frame = cap.read()
            if not ok or frame is None:
                print("Frame grab failed; exiting.")
                break

            cv2.imshow(window, frame)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q"), 27):  # q or Esc
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
