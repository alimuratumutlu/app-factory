import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const sourcePath =
  process.argv[2] ??
  "/Users/muratumutlu/Hassar/app-projects/5-min-dhikr/lib/coreDhikrs.ts";
const outputPath = process.argv[3] ?? "data/spiritual-practices.json";

const source = readFileSync(sourcePath, "utf8");

function extractCoreDhikrs(sourceText) {
  const markerIndex = sourceText.indexOf("const CORE_DHIKRS");
  if (markerIndex === -1) {
    throw new Error("Could not find CORE_DHIKRS in source file.");
  }

  const equalsIndex = sourceText.indexOf("=", markerIndex);
  const arrayStart = sourceText.indexOf("[", equalsIndex);
  if (equalsIndex === -1 || arrayStart === -1) {
    throw new Error("Could not find CORE_DHIKRS array literal.");
  }

  let depth = 0;
  let arrayEnd = -1;
  for (let index = arrayStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = index + 1;
        break;
      }
    }
  }

  if (arrayEnd === -1) {
    throw new Error("Could not close CORE_DHIKRS array literal.");
  }

  return JSON.parse(sourceText.slice(arrayStart, arrayEnd));
}

function toCatalogPractice(item) {
  return {
    id: item.id,
    type: item.type,
    label: item.arabic,
    displayText: item.arabic,
    transliteration: item.transliteration,
    category: item.category,
    intentions: item.intentions,
    schedule: {
      days: item.days,
      timingLabel: item.timing,
      frequency: item.frequency,
      count: item.target,
      timeOfDay: null,
    },
    source: {
      project: "5-min-dhikr",
      path: "lib/coreDhikrs.ts",
      sourceId: item.id,
      reviewStatus: "needs_religious_review",
    },
  };
}

function validateCatalog(catalog) {
  const failures = [];
  const ids = new Set();

  if (catalog.version !== "1.0.0") failures.push("Catalog version must be 1.0.0.");
  if (!Array.isArray(catalog.practices)) failures.push("Catalog practices must be an array.");

  for (const practice of catalog.practices ?? []) {
    if (!practice.id) failures.push("Every practice must include id.");
    if (ids.has(practice.id)) failures.push(`Duplicate practice id: ${practice.id}`);
    ids.add(practice.id);
    if (!["Esma", "Dua", "Dhikr"].includes(practice.type)) {
      failures.push(`${practice.id}: type must be Esma, Dua, or Dhikr.`);
    }
    if (!practice.label) failures.push(`${practice.id}: label is required.`);
    if (!practice.transliteration) failures.push(`${practice.id}: transliteration is required.`);
    if (!Array.isArray(practice.intentions) || practice.intentions.length === 0) {
      failures.push(`${practice.id}: intentions must be a non-empty array.`);
    }
    if (!Array.isArray(practice.schedule?.days)) {
      failures.push(`${practice.id}: schedule.days must be an array.`);
    }
    if (!practice.schedule?.timingLabel) {
      failures.push(`${practice.id}: schedule.timingLabel is required.`);
    }
    if (!Number.isFinite(practice.schedule?.count) || practice.schedule.count <= 0) {
      failures.push(`${practice.id}: schedule.count must be a positive number.`);
    }
    if (practice.schedule?.timeOfDay !== null) {
      failures.push(`${practice.id}: schedule.timeOfDay must be null unless source has an exact clock time.`);
    }
    if (!practice.source?.path) failures.push(`${practice.id}: source.path is required.`);
    if (!practice.source?.reviewStatus) {
      failures.push(`${practice.id}: source.reviewStatus is required.`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Catalog validation failed:\n- ${failures.join("\n- ")}`);
  }
}

const sourceItems = extractCoreDhikrs(source);
const practices = sourceItems.map(toCatalogPractice);
const catalog = {
  version: "1.0.0",
  source: {
    project: "5-min-dhikr",
    path: "lib/coreDhikrs.ts",
    importedFields: [
      "id",
      "arabic",
      "transliteration",
      "timing",
      "days",
      "frequency",
      "category",
      "type",
      "target",
      "intentions",
    ],
  },
  practices,
};

validateCatalog(catalog);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Imported ${catalog.practices.length} spiritual practices to ${outputPath}.`);
