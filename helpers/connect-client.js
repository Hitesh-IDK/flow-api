import mongoDb from "mongodb";
import {} from "dotenv/config";

export default async () => {
  return await mongoDb.MongoClient.connect(process.env.MONGODRIVER);
};
