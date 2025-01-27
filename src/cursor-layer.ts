const cursorLayer = Object.assign(document.createElement("div"), {
  style: `position: fixed; width: 100vw; height: 100vh; top: 0; left: 0; z-index: 99999999; display: none;`,
})
document.body.appendChild(cursorLayer)

type CursorType =
  | "alias"
  | "all-scroll"
  | "auto"
  | "cell"
  | "col-resize"
  | "context-menu"
  | "copy"
  | "crosshair"
  | "default"
  | "e-resize"
  | "ew-resize"
  | "grab"
  | "grabbing"
  | "help"
  | "move"
  | "n-resize"
  | "ne-resize"
  | "nesw-resize"
  | "ns-resize"
  | "nw-resize"
  | "nwse-resize"
  | "no-drop"
  | "none"
  | "not-allowed"
  | "pointer"
  | "progress"
  | "row-resize"
  | "s-resize"
  | "se-resize"
  | "sw-resize"
  | "text"
  | "url"
  | "w-resize"
  | "wait"
  | "zoom-in"
  | "zoom-out"

export const cursor = {
  show(cursorType: CursorType) {
    cursorLayer.style.display = "block"
    cursorLayer.style.setProperty("cursor", cursorType, "important")
  },
  hide() {
    cursorLayer.style.display = "none"
  },
}
