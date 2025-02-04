export function calculateRadians(
  targetX: number,
  targetY: number,
  cursorX: number,
  cursorY: number,
) {
  return Math.atan2(cursorY - targetY, cursorX - targetX)
}

export function radiansToDegrees(radians: number) {
  return (radians / Math.PI) * 180
}

export function degreesToRadians(degrees: number) {
  return (degrees / 180) * Math.PI
}
