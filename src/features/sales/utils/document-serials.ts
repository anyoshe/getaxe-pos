const MARKER = "[SERIAL_MAP]";

export type SerialMap = Record<string, string[]>;

export function encodeSerialMap(map: SerialMap): string {
  return `${MARKER}${JSON.stringify(map)}`;
}

export function decodeSerialMap(notes: string | null | undefined): SerialMap {
  if (!notes) return {};
  const idx = notes.indexOf(MARKER);
  if (idx < 0) return {};
  try {
    const json = notes.slice(idx + MARKER.length).trim();
    // notes may have more text after — take until end or whitespace+non-json
    const parsed = JSON.parse(json) as SerialMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    // try extract JSON object only
    const start = notes.indexOf("{", idx);
    if (start < 0) return {};
    let depth = 0;
    let end = -1;
    for (let i = start; i < notes.length; i++) {
      if (notes[i] === "{") depth++;
      if (notes[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end < 0) return {};
    try {
      return JSON.parse(notes.slice(start, end)) as SerialMap;
    } catch {
      return {};
    }
  }
}
