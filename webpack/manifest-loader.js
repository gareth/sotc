import packageJson from "../package.json" with { type: "json" };
const { version: packageVersion } = packageJson;
import keys from "../src/chrome/config/manifest_key.js";

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
  const mode = this._compiler?.options?.mode || "production";
  const key = keys[mode];

  const merged = Object.assign({}, JSON.parse(source), manifest, { key });

  const manifestJson = JSON.stringify(merged, null, 2);
  // In Webpack, loaders ultimately produce JavaScript. In order to produce
  // another file type (like JSON), it needs to be emitted separately.
  this.emitFile("manifest.json", manifestJson);
  // Return the processed JSON to be used by the next item in the loader chain.
  return "{}";
}
