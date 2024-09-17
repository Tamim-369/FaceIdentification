import User from "../model/userModel.js";
import { connect } from "../utils/connection.js";
export async function findUsers(req, res) {
  try {
    await connect();
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json([...users]);
  } catch (error) {
    return res.status(404).json({ message: "something went wrong" });
  }
}
