import ownerId from ".././config/owner_id";
import clientId from ".././config/client_id";
import secret from ".././config/secret";
import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { EbsCallConfig } from "@twurple/ebs-helper";
import { compress, decompress } from "lzutf8";
import { TaggedLogger } from "../util/TaggedLogger";

const logger = new TaggedLogger("Sync");

const ebsCallConfig: EbsCallConfig = {
  ownerId,
  clientId,
  secret,
};

const stringInfo = (input: string, refSize?: number) => {
  const inputSize = new Blob([input]).size;
  const comparison = refSize ? `, ${Math.round((100 * (inputSize - refSize)) / refSize)}%` : "";
  return `(${input.length} chars / ${inputSize} bytes${comparison})`;
};

export function encode<T extends object>(data: T): string {
  const target = JSON.stringify(data);
  logger.debug("Compressing", target, stringInfo(target));
  const compressed = compress(target, { outputEncoding: "BinaryString" }) as string;
  logger.debug("Compressed to", compressed, stringInfo(compressed, new Blob([target]).size));
  return compressed;
}

export function decode(data: string) {
  logger.debug("Retrieving", data);
  if (data) {
    return JSON.parse(decompress(data, { inputEncoding: "BinaryString" }) as string) as object;
  } else {
    throw new Error("No data to decode");
  }
}

export const synchronizeExtensionState = async (broadcasterId: string, data: object) => {
  logger.debug("Synchronising object", data);
  const encoded = encode(data);

  await setExtensionBroadcasterConfiguration(ebsCallConfig, broadcasterId, encoded).catch((e) => {
    logger.error("Error setting config", e);
    throw e;
  });
};

export const broadcastStateChange = async (broadcasterId: string, key: string, data: object) => {
  const message = { type: "updateState", key, payload: data };
  await sendExtensionPubSubBroadcastMessage(ebsCallConfig, broadcasterId, encode(message));
};
