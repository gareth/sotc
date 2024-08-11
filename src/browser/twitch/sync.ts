import ownerId from "../../core/config/owner_id";
import clientId from "../../core/config/client_id";
import secret from "../../core/config/secret";
import {
  sendExtensionPubSubBroadcastMessage,
  sendExtensionPubSubWhisperMessage,
  setExtensionBroadcasterConfiguration,
} from "@twurple/ebs-helper";
import { EbsCallConfig } from "@twurple/ebs-helper";
import { compress, decompress } from "lzutf8";
import { TaggedLogger } from "../../core/util/TaggedLogger";
import sentry from "../../core/util/sentry";

const logger = new TaggedLogger("Sync");

const ebsCallConfig: EbsCallConfig = {
  ownerId,
  clientId,
  secret,
};

import { HttpStatusCodeError } from "@twurple/api-call";
import { ExtensionState } from "../types/sotc";

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
  logger.debug("Retrieving", data, stringInfo(data));
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
    if (e instanceof HttpStatusCodeError) {
      switch (e.statusCode) {
        case 409: // Conflict
          // TODO: Handle conflict error
          logger.warn("State wasn't synchronised, deferring until next update");
          break;

        case 429: // Too many requests
          // TODO: Handle rate limit error
          break;
      }
      sentry.captureException(e);
    }
  });
}

export async function broadcastBulkStateChange(broadcasterId: string, data: Partial<ExtensionState>) {
  await broadcast(broadcasterId, { type: "bulkUpdateState", payload: data });
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
