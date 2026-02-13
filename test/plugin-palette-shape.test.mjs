import test from "node:test";
import assert from "node:assert/strict";
import { generatePalette } from "../palette.mjs";

test("plugin palette mapping shape for e96443 @ 10-step scale", () => {
  const swatches = generatePalette("#e96443", 10);

  assert.equal(swatches.length, 19);
  assert.deepEqual(
    swatches.slice(0, 3).map((s) => s.role),
    ["shade", "shade", "shade"]
  );
  assert.equal(swatches[9].role, "base");
  assert.equal(swatches[9].step, 0);
  assert.equal(swatches[9].hex, "#e96443");
  assert.equal(swatches[9].label, "base");
  assert.deepEqual(
    swatches.slice(10, 13).map((s) => s.role),
    ["tint", "tint", "tint"]
  );
  assert.deepEqual(
    swatches.slice(0, 3).map((s) => s.label),
    ["shade-10", "shade-20", "shade-30"]
  );
  assert.deepEqual(
    swatches.slice(10, 13).map((s) => s.label),
    ["tint-10", "tint-20", "tint-30"]
  );
  assert.ok(swatches.every((s) => /^#[0-9a-f]{6}$/.test(s.hex)));
});

test("plugin palette mapping shape for 336699 @ 20-step scale", () => {
  const swatches = generatePalette("#336699", 5);

  assert.equal(swatches.length, 39);
  assert.equal(swatches[0].role, "shade");
  assert.equal(swatches[0].step, 5);
  assert.equal(swatches[0].label, "shade-5");
  assert.equal(swatches[18].role, "shade");
  assert.equal(swatches[18].step, 95);
  assert.equal(swatches[18].label, "shade-95");
  assert.equal(swatches[19].role, "base");
  assert.equal(swatches[19].step, 0);
  assert.equal(swatches[19].hex, "#336699");
  assert.equal(swatches[20].role, "tint");
  assert.equal(swatches[20].step, 5);
  assert.equal(swatches[20].label, "tint-5");
  assert.equal(swatches[38].role, "tint");
  assert.equal(swatches[38].step, 95);
  assert.equal(swatches[38].label, "tint-95");
  assert.ok(swatches.every((s) => /^#[0-9a-f]{6}$/.test(s.hex)));
});
