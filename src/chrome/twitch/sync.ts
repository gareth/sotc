import ownerId from ".././config/owner_id";
import clientId from ".././config/client_id";
import secret from ".././config/secret";
import {
  sendExtensionPubSubBroadcastMessage,
  sendExtensionPubSubWhisperMessage,
  setExtensionBroadcasterConfiguration,
} from "@twurple/ebs-helper";
import { EbsCallConfig } from "@twurple/ebs-helper";
import { compress, decompress } from "lzutf8";
import { TaggedLogger } from "../util/TaggedLogger";
import sentry from "../util/sentry";

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

export async function synchronizeExtensionState(broadcasterId: string, data: object) {
  logger.debug("Synchronising object", data);
  const encoded = encode(data);

  await setExtensionBroadcasterConfiguration(ebsCallConfig, broadcasterId, encoded).catch((e) => {
    sentry.captureException(e);
  });
}

export async function broadcastStateChange(broadcasterId: string, key: string, data: object) {
  await broadcast(broadcasterId, { type: "updateState", key, payload: data });
}

export async function broadcast(broadcasterId: string, message: object) {
  await sendExtensionPubSubBroadcastMessage(ebsCallConfig, broadcasterId, encode(message)).catch((e) => {
    sentry.captureException(e);
  });
}

export async function whisper(broadcasterId: string, userId: string, message: object) {
  return await sendExtensionPubSubWhisperMessage(ebsCallConfig, broadcasterId, userId, JSON.stringify(message)).catch(
    (e) => {
      sentry.captureException(e);
    }
  );
}
