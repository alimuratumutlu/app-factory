import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const examplesRoot = "examples";
const pipelinePaths = readdirSync(examplesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(examplesRoot, entry.name, "pipeline.json"));
const solutionMapPaths = readdirSync(examplesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(examplesRoot, entry.name, "solution-map.json"));
const spiritualCatalogPath = "data/spiritual-practices.json";

const failures = [];

for (const pipelinePath of pipelinePaths) {
  try {
    readFileSync(pipelinePath, "utf8");
  } catch {
    continue;
  }

  const pipeline = JSON.parse(readFileSync(pipelinePath, "utf8"));
  const nodeIds = new Set();

  if (!pipeline.version) failures.push(`${pipelinePath}: Pipeline must include version.`);
  if (!pipeline.name) failures.push(`${pipelinePath}: Pipeline must include name.`);
  if (!Array.isArray(pipeline.nodes)) failures.push(`${pipelinePath}: Pipeline nodes must be an array.`);
  if (!Array.isArray(pipeline.edges)) failures.push(`${pipelinePath}: Pipeline edges must be an array.`);

  for (const node of pipeline.nodes ?? []) {
    if (!node.id) failures.push(`${pipelinePath}: Every node must include id.`);
    if (!node.type) failures.push(`${pipelinePath}: Node ${node.id ?? "(unknown)"} must include type.`);
    if (!node.label) failures.push(`${pipelinePath}: Node ${node.id ?? "(unknown)"} must include label.`);
    if (nodeIds.has(node.id)) failures.push(`${pipelinePath}: Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
  }

  for (const edge of pipeline.edges ?? []) {
    if (!edge.id) failures.push(`${pipelinePath}: Every edge must include id.`);
    if (!nodeIds.has(edge.source)) failures.push(`${pipelinePath}: Edge ${edge.id} has unknown source: ${edge.source}`);
    if (!nodeIds.has(edge.target)) failures.push(`${pipelinePath}: Edge ${edge.id} has unknown target: ${edge.target}`);
  }
}

for (const solutionMapPath of solutionMapPaths) {
  let solutionMap;
  try {
    solutionMap = JSON.parse(readFileSync(solutionMapPath, "utf8"));
  } catch {
    continue;
  }

  if (!solutionMap.version) failures.push(`${solutionMapPath}: Solution map must include version.`);
  if (!solutionMap.id) failures.push(`${solutionMapPath}: Solution map must include id.`);
  if (!solutionMap.title) failures.push(`${solutionMapPath}: Solution map must include title.`);
  if (!solutionMap.problem?.original) failures.push(`${solutionMapPath}: Solution map must include problem.original.`);
  if (!solutionMap.problem?.understood) failures.push(`${solutionMapPath}: Solution map must include problem.understood.`);
  if (!solutionMap.problem?.bottleneck) failures.push(`${solutionMapPath}: Solution map must include problem.bottleneck.`);
  if (!solutionMap.outcome?.desired) failures.push(`${solutionMapPath}: Solution map must include outcome.desired.`);
  if (!Array.isArray(solutionMap.actions)) failures.push(`${solutionMapPath}: Solution map actions must be an array.`);
  if (!Array.isArray(solutionMap.checkpoints)) failures.push(`${solutionMapPath}: Solution map checkpoints must be an array.`);
}

if (existsSync(spiritualCatalogPath)) {
  const catalog = JSON.parse(readFileSync(spiritualCatalogPath, "utf8"));
  const practiceIds = new Set();

  if (!catalog.version) failures.push(`${spiritualCatalogPath}: Catalog must include version.`);
  if (!catalog.source?.path) failures.push(`${spiritualCatalogPath}: Catalog must include source.path.`);
  if (!Array.isArray(catalog.practices)) failures.push(`${spiritualCatalogPath}: Catalog practices must be an array.`);

  for (const practice of catalog.practices ?? []) {
    if (!practice.id) failures.push(`${spiritualCatalogPath}: Every practice must include id.`);
    if (practiceIds.has(practice.id)) failures.push(`${spiritualCatalogPath}: Duplicate practice id: ${practice.id}`);
    practiceIds.add(practice.id);
    if (!["Esma", "Dua", "Dhikr"].includes(practice.type)) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} has unsupported type.`);
    if (!practice.label) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include label.`);
    if (!practice.transliteration) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include transliteration.`);
    if (!Array.isArray(practice.intentions) || practice.intentions.length === 0) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include intentions.`);
    if (!Array.isArray(practice.schedule?.days)) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include schedule.days.`);
    if (!practice.schedule?.timingLabel) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include schedule.timingLabel.`);
    if (!Number.isFinite(practice.schedule?.count) || practice.schedule.count <= 0) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include positive schedule.count.`);
    if (!("timeOfDay" in (practice.schedule ?? {}))) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include schedule.timeOfDay.`);
    if (!practice.source?.path) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include source.path.`);
    if (!practice.source?.reviewStatus) failures.push(`${spiritualCatalogPath}: Practice ${practice.id ?? "(unknown)"} must include source.reviewStatus.`);
  }
}

if (failures.length > 0) {
  console.error("Example validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Example validation passed.");
