import { exec } from "child_process";
import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";

const LEXICON_PREFIXES_TO_FETCH = ["com/atproto/repo"];
const LEXICON_OUTPUT_PATH = path.resolve(import.meta.dirname, "../../lexicons");

const isWorkingDirectoryClean = await new Promise<boolean>((resolve, reject) =>
  exec("git diff --quiet", (err) => {
    if (err) {
      return reject(err);
    }
  }).on("exit", (code) => {
    if (code === 0) {
      resolve(true);
    } else {
      resolve(false);
    }
  }),
);

if (!isWorkingDirectoryClean) {
  console.error("ERR: Working directory is not clean");
  process.exit(1);
}

const zipBuffer = await fetch(
  "https://github.com/bluesky-social/atproto/archive/refs/heads/main.zip",
).then((res) => res.arrayBuffer());

// We assume that the lexicons are in the atproto-main/lexicons/ folder
const LEXICON_REPO_PATH_PREFIX = "atproto-main/lexicons/";

const zip = new AdmZip(Buffer.from(zipBuffer));

const lexiconEntries = zip
  .getEntries()
  .filter(
    (entry) =>
      LEXICON_PREFIXES_TO_FETCH.some((prefix) =>
        entry.entryName.startsWith(LEXICON_REPO_PATH_PREFIX + prefix),
      ) && !entry.isDirectory,
  );

await Promise.all(
  lexiconEntries.map(async (entry) => {
    const entryDirectory = entry.entryName
      .replace(LEXICON_REPO_PATH_PREFIX, "")
      .split("/")
      .slice(0, -1)
      .join("/");
    const filename = entry.entryName.split("/").slice(-1)[0];
    if (!filename) {
      throw new Error("Filename is empty from entry: " + entry.entryName);
    }

    const outputDirectory = path.join(LEXICON_OUTPUT_PATH, entryDirectory);
    await fs.mkdir(outputDirectory, { recursive: true });

    const content = zip.readFile(entry);
    if (!content) {
      throw new Error("Content is missing");
    }

    const outputPath = path.join(outputDirectory, filename);
    console.log(`Writing ${outputPath}`);
    await fs.writeFile(outputPath, content);
  }),
);
