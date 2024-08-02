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
      strict_min_version: "42.0",
    },
  };

  return JSON.stringify(config);
}
