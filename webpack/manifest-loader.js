import packageVersion from "../src/chrome/version.js";
import keys from "../src/chrome/config/manifest_key.js";

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = 0] = packageVersion
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[-.]/);

export default function (source) {
  const mode = this._compiler?.options?.mode || "production";
  const key = keys[mode];

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:ZT]/g, "")
    .replace(/\..*/, "");

  const version = `${major}.${minor}.${patch}.${label}`;
  const version_suffix = mode == "production" ? "" : `-${mode}`;
  const version_name = `${version} (${timestamp}${version_suffix})`;
  console.info(version_name);

  const manifest = {
    version,
    version_name,
  };

  const merged = Object.assign({}, JSON.parse(source), manifest, { key });

  const manifestJson = JSON.stringify(merged, null, 2);
  // In Webpack, loaders ultimately produce JavaScript. In order to produce
  // another file type (like JSON), it needs to be emitted separately.
  this.emitFile("manifest.json", manifestJson);
  // Return the processed JSON to be used by the next item in the loader chain.
  return "{}";
}
