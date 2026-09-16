import test from "node:test";
import assert from "node:assert/strict";
import { readJsonl } from "../src/io.mjs";
import { retrieve } from "../src/retriever.mjs";

const corpus = await readJsonl(new URL("../fixtures/corpus.jsonl", import.meta.url));

test("file-format query ranks the format source first", () => {
  const [first] = retrieve("Which file formats can I upload?", corpus);
  assert.equal(first.id, "overview-formats");
});

test("unsupported pricing query has no confident match", () => {
  const [first] = retrieve("What is the monthly subscription price?", corpus);
  assert.ok(!first || first.score < 0.28);
});

test("failure question ranks ingestion policy first", () => {
  const [first] = retrieve("What happens after an ingestion file keeps failing?", corpus);
  assert.equal(first.id, "ingestion-sync");
});
