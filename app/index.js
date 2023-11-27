const mongoDb = require("mongodb");
const express = require("express");

const app = express();

app.use(express.json());

const connectToClient = async () => {
  return await mongoDb.MongoClient.connect(
    `mongodb+srv://hitesh:auAcvH5phDun2Gyj@auth-data.nnuhvf6.mongodb.net/flow-ui?retryWrites=true&w=majority`
  );
};

const orderFlows = (flows) => {
  let counter = 0;
  const sortedFlows = [];

  for (_ in flows) {
    for (index in flows) {
      if (flows[index].id === counter) {
        sortedFlows.push(flows[index]);
        counter++;
        break;
      }
    }
  }

  return sortedFlows;
};

app.get("/api/flows", (req, res) => {
  const sendFlows = async () => {
    let client = "";

    try {
      client = await connectToClient();
    } catch (e) {
      res.status(500).json({
        message: "Server is unable to connect to the database: " + e.message,
      });
      return;
    }
    const flows1 = orderFlows(
      await client.db().collection("flows1").find().toArray()
    );
    const flows2 = orderFlows(
      await client.db().collection("flows2").find().toArray()
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

  const flow1 = data.flow1;
  const flow2 = data.flow2;

  const replaceFlows = async () => {
    let client = "";
    try {
      client = await connectToClient();
    } catch (e) {
      res.status(500).json({
        message: "Server is unable to connect to the database: " + e.message,
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

const port = 8888;
app.listen(port, () => {
  `API Running on port ${port}`;
});
