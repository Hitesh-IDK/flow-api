import connectToClient from "../helpers/connect-client.js";
import Express from "express";
import {
  isAllowedToSignIn,
  isAllowedToSignUp,
  isAllowedToUpdate,
} from "../helpers/auth.js";
import {
  TrimFlows,
  OrderFlows,
  PrepareFlows,
} from "../helpers/data-process.js";
import bcrypt, { genSalt } from "bcrypt";

const app = Express();

app.use(Express.json());

app.get("/api/flows", (req, res) => {
  console.log("Req recieved");
  const sendFlows = async () => {
    let client = "";

    try {
      client = await connectToClient();
    } catch (e) {
      res.status(500).json({
        message: "Server is unable to connect to the database",
      });
      return;
    }

    const flows1 = PrepareFlows(
      OrderFlows(await client.db().collection("flows1").find().toArray())
    );
    const flows2 = PrepareFlows(
      OrderFlows(await client.db().collection("flows2").find().toArray())
    );

    res.status(200).json({
      data: [flows1, flows2],
    });

    client.close();
  };

  sendFlows();
});

app.post("/api/flows", (req, res) => {
  const data = req.body;

  const flow1 = TrimFlows(data.flow1);
  const flow2 = TrimFlows(data.flow2);

  const replaceFlows = async () => {
    let client = "";
    try {
      client = await connectToClient();
    } catch (e) {
      res.status(500).json({
        message: "Server is unable to connect to the database: ",
      });
      return;
    }

    const flow1Delete = await client.db().collection("flows1").deleteMany({});
    const flow2Delete = await client.db().collection("flows2").deleteMany({});

    const flowsDb1 =
      flow1Delete.acknowledged &&
      (await client.db().collection("flows1").insertMany(flow1));
    const flowsDb2 =
      flow2Delete.acknowledged &&
      (await client.db().collection("flows2").insertMany(flow2));

    if (flowsDb1.acknowledged && flowsDb2.acknowledged) {
      res.status(201).json({ message: "Save successfull" });
    } else {
      res.status(500).json({ message: "Server has into some kind of issue" });
    }

    client.close();
  };

  replaceFlows();
});

app.get("/api/auth", (req, res) => {
  res.status(404).json({ message: "route not implemented" });
});

app.patch("/api/auth/credentials/update", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const { isAllowed, message } = await isAllowedToUpdate(
    email,
    oldPassword,
    newPassword
  );

  if (!isAllowed) {
    res.status(401).json({ message });
    return;
  }

  const client = await connectToClient();
  const hashedPassword = await bcrypt.hash(newPassword, await genSalt());

  const updateRes = await client
    .db()
    .collection("users")
    .updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
        $currentDate: {
          lastUpdated: true,
        },
      }
    );

  console.log(updateRes);

  res.status(200).json({ message: "Hey" });
});

app.post("/api/auth/credentials", async (req, res) => {
  console.log("Start");
  const data = req.body;

  if (data.action === "signIn") {
    if (!(await isAllowedToSignIn(data.email, data.password))) {
      res.status(404).json({ message: "user not found, consider signing up" });
      return;
    }

    res.status(200).json({ message: "user exists, logging in" });
    return;
  }

  if (data.action === "signUp") {
    const client = await connectToClient();
    if (!(await isAllowedToSignUp(data.email))) {
      res
        .status(403)
        .json({ message: "user alreay exists, consider signing in" });
      return;
    }

    const userCreate = await client.db().collection("users").insertOne({
      email: data.email,
      password: data.password,
      type: "credentials",
    });

    if (!userCreate.acknowledged) {
      res.status(400).json({ message: "Something went wrong, try again" });
      console.log("Problem here");
      return;
    }

    res.status(200).json({ message: "About to sign in", data: userCreate });
    return;
  }

  res.status(404).json({ message: "unknown action code used" });
});

app.post("/api/auth/google", (req, res) => {
  const data = req.body;
});

const port = 8666;
app.listen(port, () => {
  `API Running on port ${port}`;
});
