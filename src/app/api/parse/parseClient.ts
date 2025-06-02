import Parse from "parse";

// Your Back4App keys
Parse.initialize(
  process.env.NEXT_PUBLIC_XParseApplicationId!,
  process.env.NEXT_PUBLIC_XParseJSAPIKey!
);
Parse.serverURL = process.env.NEXT_PUBLIC_BASE_URL!;

// LiveQuery setup
export const liveQueryClient = new Parse.LiveQueryClient({
  applicationId: process.env.NEXT_PUBLIC_XParseApplicationId!,
  serverURL: process.env.NEXT_PUBLIC_SOCKET_URL!,
  javascriptKey: process.env.NEXT_PUBLIC_XParseJSAPIKey!,
  masterKey: undefined,
  sessionToken: undefined,
  installationId: undefined,
});
liveQueryClient.open();

export default Parse;
