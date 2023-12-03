import connectClient from "./connect-client.js";
import bcrypt from "bcrypt";

export const isAllowedToSignIn = async (email, password) => {
  const client = await connectClient();

  const dbFetch = await client.db().collection("users").findOne({ email });

  if (dbFetch) {
    if (await bcrypt.compare(password, dbFetch.password)) return true;
  }

  client.close();
  return false;
};

export const isAllowedToSignUp = async (email) => {
  const client = await connectClient();

  console.log(email);

  const dbFetch = await client
    .db()
    .collection("users")
    .findOne({ email: email });

  client.close();
  return !dbFetch;
};
