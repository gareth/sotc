export default function (source) {
  const config = JSON.parse(source);

  const service_worker = config.background?.service_worker;
  if (service_worker) {
    delete config.background.service_worker;
    config.background.scripts = [service_worker];
  }

  config.browser_specific_settings = {
    gecko: {
      id: "extension@streamontheclocktower.example",
      strict_min_version: "128.0",
    },
  };

  if (config.key) delete config.key;
  if (config.version_name) delete config.version_name;

  return JSON.stringify(config);
}
