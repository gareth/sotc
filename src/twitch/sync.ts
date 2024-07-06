import ownerId from "../../config/owner_id";
import clientId from "../../config/client_id";
import secret from "../../config/secret";
import { setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { EbsCallConfig } from "@twurple/ebs-helper";

const ebsCallConfig: EbsCallConfig = {
  ownerId,
  clientId,
  secret,
};

export const synchronizeExtensionState = async (broadcasterId: string, data: object) => {
  // FIXME: This ends up calling XMLHttpRequest which is unavailable in an
  // extension context. Patch this method to use native `fetch`
  // See: https://discord.com/channels/325552783787032576/1259059116484329472
  await setExtensionBroadcasterConfiguration(ebsCallConfig, broadcasterId, JSON.stringify(data));
};
