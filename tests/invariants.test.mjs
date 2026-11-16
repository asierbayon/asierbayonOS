import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const compile = (file) => {
  const exports = {};
  const source = read(`../app/${file}.ts`);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, { exports });
  return exports;
};

const webpSize = (path) => {
  const bytes = readFileSync(path);
  const kind = bytes.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") {
    const value = bytes.readUInt32LE(21);
    return [(value & 0x3fff) + 1, ((value >> 14) & 0x3fff) + 1];
  }
  return [NaN, NaN];
};

const jpegSize = (path) => {
  const bytes = readFileSync(path);
  let index = 2;
  while (index < bytes.length - 8) {
    if (bytes[index] !== 0xff) {
      index += 1;
      continue;
    }
    const marker = bytes[index + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return [bytes.readUInt16BE(index + 7), bytes.readUInt16BE(index + 5)];
    }
    const length = bytes.readUInt16BE(index + 2);
    index += 2 + length;
  }
  return [NaN, NaN];
};

test("youtube messages are accepted only from the player frame", () => {
  const media = compile("media");
  const frame = {};
  const iframe = { contentWindow: frame };
  assert.equal(
    media.isYouTubePlayerEvent({ origin: "https://www.youtube.com", source: frame }, iframe),
    true,
  );
  assert.equal(
    media.isYouTubePlayerEvent({ origin: "https://evil.test", source: frame }, iframe),
    false,
  );
  assert.equal(
    media.isYouTubePlayerEvent({ origin: "https://www.youtube.com", source: {} }, iframe),
    false,
  );
  assert.equal(media.readPlayerErrorCode({ videoData: { errorCode: "auth" } }), "auth");
  assert.equal(media.readPlayerErrorCode({ videoData: { errorCode: "none" } }), null);
  assert.ok(media.playlist.length > 0);
});

test("greeting folding does not depend on regex lookbehind", () => {
  const source = read("../app/chatgpt-intent.ts");
  assert.equal(source.includes("(?<"), false);
  const intent = compile("chatgpt-intent");
  assert.equal(intent.classifyPrompt("Hiiii!!"), "greeting");
  assert.equal(intent.classifyPrompt("¡Hola!"), "greeting");
});

test("the canned ChatGPT answer can be cut at Momentum", () => {
  const source = read("../app/chatgpt.tsx");
  const answer = /const ANSWER = `([\s\S]*?)`;/.exec(source)?.[1];
  assert.ok(answer?.includes("Momentum"));
});

test("instagram posts, albums, and image files agree", () => {
  const instagram = read("../app/instagram.tsx");
  const photos = read("../app/photos.tsx");
  const posts = [
    ...instagram.matchAll(/\{\s*id: "([^"]+)",\s*width: (\d+),\s*height: (\d+),([\s\S]*?)\n  \},/g),
  ].map((match) => ({
    id: match[1],
    width: Number(match[2]),
    height: Number(match[3]),
    date: /date: "([^"]+)"/.exec(match[4])?.[1] ?? "",
  }));
  assert.ok(posts.length > 0);
  const ids = posts.map((post) => post.id);
  assert.equal(new Set(ids).size, ids.length);

  const months = "January|February|March|April|May|June|July|August|September|October|November|December";
  for (const post of posts) {
    assert.match(post.date, new RegExp(`^(${months}) \\d{1,2}(?:, \\d{4})?$`));
    const full = new URL(`../public/asier/instagram/${post.id}.webp`, import.meta.url);
    const thumb = new URL(`../public/asier/instagram/${post.id}-thumb.webp`, import.meta.url);
    assert.equal(existsSync(full), true, post.id);
    assert.equal(existsSync(thumb), true, post.id);
    const [width, height] = webpSize(full);
    assert.ok(Math.abs(width / height - post.width / post.height) / (width / height) < 0.01, post.id);
  }

  const albumBlock = photos.slice(
    photos.indexOf("const albumPhotoIds"),
    photos.indexOf("const libraryCollections"),
  );
  const albumKeys = new Set([
    "switzerland",
    "glaciers",
    "night",
    "iceland",
    "madeira",
    "library",
    "favorites",
  ]);
  const albumIds = [...albumBlock.matchAll(/"([a-z0-9-]+)"/g)]
    .map((match) => match[1])
    .filter((id) => !albumKeys.has(id));
  assert.ok(albumIds.length > 0);
  for (const id of albumIds) {
    assert.ok(ids.includes(id), id);
  }

  const favorites = /INITIAL_FAVORITE_IDS = \[([^\]]+)\]/.exec(photos)?.[1] ?? "";
  for (const id of favorites.matchAll(/"([^"]+)"/g)) {
    assert.ok(ids.includes(id[1]), id[1]);
  }
});

test("referenced image files exist and hard-coded ratios match", () => {
  const files = readdirSync(new URL("../app", import.meta.url))
    .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts") || name.endsWith(".css"));
  const paths = new Set();
  for (const name of files) {
    const text = read(`../app/${name}`);
    for (const match of text.matchAll(/["'`](\/(?:asier|og\.png|favicon\.svg)[^"'`\s$]*)["'`]/g)) {
      paths.add(match[1]);
    }
  }
  for (const assetPath of paths) {
    assert.equal(existsSync(new URL(`../public${assetPath}`, import.meta.url)), true, assetPath);
  }

  const page = read("../app/page.tsx");
  const ratios = [...page.matchAll(/ratio: (\d+) \/ (\d+)/g)];
  assert.equal(ratios.length, 2);
  const filesByRatio = [
    ["public/asier/iq-bell-curve.jpg", ratios[0]],
    ["public/asier/so-smart-why-not-rich.jpg", ratios[1]],
  ];
  for (const [relative, match] of filesByRatio) {
    const [width, height] = jpegSize(new URL(`../${relative}`, import.meta.url));
    assert.equal(width, Number(match[1]));
    assert.equal(height, Number(match[2]));
  }

  const og = execFileSync("file", ["-b", fileURLToPath(new URL("../public/og.png", import.meta.url))], {
    encoding: "utf8",
  });
  assert.match(og, /1200 x 630/);
});
