import test from "node:test";
import assert from "node:assert/strict";
import { calculateShades, calculateTints } from "@edelstone/tints-and-shades";

const RATIOS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const PERCENTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

const SNAPSHOTS = {
  "336699": {
    shades: [
      "2e5c8a",
      "29527a",
      "24476b",
      "1f3d5c",
      "1a334d",
      "14293d",
      "0f1f2e",
      "0a141f",
      "050a0f"
    ],
    tints: [
      "4775a3",
      "5c85ad",
      "7094b8",
      "85a3c2",
      "99b3cc",
      "adc2d6",
      "c2d1e0",
      "d6e0eb",
      "ebf0f5"
    ]
  },
  e96443: {
    shades: [
      "d25a3c",
      "ba5036",
      "a3462f",
      "8c3c28",
      "753222",
      "5d281b",
      "461e14",
      "2f140d",
      "170a07"
    ],
    tints: [
      "eb7456",
      "ed8369",
      "f0937b",
      "f2a28e",
      "f4b2a1",
      "f6c1b4",
      "f8d1c7",
      "fbe0d9",
      "fdf0ec"
    ]
  },
  ffffff: {
    shades: [
      "e6e6e6",
      "cccccc",
      "b3b3b3",
      "999999",
      "808080",
      "666666",
      "4d4d4d",
      "333333",
      "1a1a1a"
    ],
    tints: [
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff",
      "ffffff"
    ]
  }
};

for (const [hex, expected] of Object.entries(SNAPSHOTS)) {
  test(`snapshot for ${hex}`, () => {
    const shades = calculateShades(hex, RATIOS);
    const tints = calculateTints(hex, RATIOS);

    assert.deepEqual(
      shades.map((item) => item.hex),
      expected.shades
    );
    assert.deepEqual(
      tints.map((item) => item.hex),
      expected.tints
    );
    assert.deepEqual(
      shades.map((item) => item.percent),
      PERCENTS
    );
    assert.deepEqual(
      tints.map((item) => item.percent),
      PERCENTS
    );
  });
}
