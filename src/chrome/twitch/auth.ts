import { Auth, OIDCIdentity } from "../stores/local";
import { TaggedLogger } from "../../core/util/TaggedLogger";
import client_id from "../../core/config/client_id";

import * as jose from "jose";
import { clone } from "../../core/util/clone";

const logger = new TaggedLogger("Auth");

export const twitchAuth = async (force_verify = false) => {
  const redirect_uri = chrome.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const scopes = ["openid", "channel:manage:predictions"];

  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  Object.entries({
    client_id, // cspell:disable-line
    state,
    nonce,
    response_type: "token id_token",
    scope: scopes.join(" "),
    force_verify,
    redirect_uri,
  }).forEach(([k, v]) => {
    url.searchParams.append(k, v.toString());
  });

  const oauthResponseUrl = await chrome.identity.launchWebAuthFlow({
    url: url.toString(),
    interactive: true,
  });

  if (oauthResponseUrl) {
    const resultURL = new URL(oauthResponseUrl);
    const params = new URLSearchParams(resultURL.hash.substring(1));
    const auth = Object.fromEntries(params.entries()) as unknown as Auth;

    if (auth.state != state) {
      throw new Error(
        `Twitch authorization failed: returned state ${auth.state} doesn't match requested state ${state}`
      );
    }

    const id = clone(jose.decodeJwt<OIDCIdentity>(auth.id_token));
    if (id.nonce != nonce) {
      throw new Error(
        `Twitch authorization failed: returned nonce ${id.nonce as string} doesn't match requested nonce ${state}`
      );
    }

    // TODO: Validate the OIDC token: https://dev.twitch.tv/docs/authentication/getting-tokens-oidc/#validating-an-id-token

    logger.debug("Got params", auth, id);
    return { auth, id };
  }
};
