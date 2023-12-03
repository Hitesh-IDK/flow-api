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

  const dbFetch = await client
    .db()
    .collection("users")
    .findOne({ email: email });

  client.close();
  return !dbFetch;
};

export const isAllowedToUpdate = async (email, oldPassword, newPassword) => {
  const client = await connectClient();

  const user = await client.db().collection("users").findOne({ email });

  if (!user)
    return { isAllowed: false, message: "Email not found in the database" };

  if (!(await bcrypt.compare(oldPassword, user.password)))
    return {
      isAllowed: false,
      message: "Old password does not match, check again",
    };

  if (await bcrypt.compare(newPassword, user.password))
    return {
      isAllowed: false,
      message: "New password cannot be the same as the old one",
    };

  client.close();
  return { isAllowed: true, message: "" };
};
