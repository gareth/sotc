import { StaticAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import clientId from ".././config/client_id";

export function twitchApi(accessToken: string) {
  const authProvider = new StaticAuthProvider(clientId, accessToken);
  return new ApiClient({ authProvider });
}
