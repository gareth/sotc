import packageJson from "../package.json" with { type: "json" };
const { version: packageVersion } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = 0] = packageVersion
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[-.]/);

const timestamp = new Date()
  .toISOString()
  .replace(/[-:ZT]/g, "")
  .replace(/\..*/, "");

const version = `${major}.${minor}.${patch}.${label}`;
const version_name = `${version} (${timestamp})`;

const manifest = {
  version,
  version_name,
};

export default function (source) {
  const merged = Object.assign({}, JSON.parse(source), manifest);

  const manifestJson = JSON.stringify(merged, null, 2);
  // In Webpack, loaders ultimately produce JavaScript. In order to produce
  // another file type (like JSON), it needs to be emitted separately.
  this.emitFile("manifest.json", manifestJson);
  // Return the processed JSON to be used by the next item in the loader chain.
  return "{}";
};
