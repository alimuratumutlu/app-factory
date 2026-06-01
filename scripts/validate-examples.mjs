import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const examplesRoot = "examples";
const pipelinePaths = readdirSync(examplesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(examplesRoot, entry.name, "pipeline.json"));

const failures = [];

for (const pipelinePath of pipelinePaths) {
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

if (failures.length > 0) {
  console.error("Example validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Example validation passed: ${pipelinePaths.join(", ")}`);
