import { Auth } from "../stores/local";
import { TaggedLogger } from "../util/TaggedLogger";
import client_id from "../../config/client_id";

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

    logger.info("Got params", auth);
    return auth;
  }
};
