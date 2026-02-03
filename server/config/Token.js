import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const genToken = (userId) => {
  try {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log("genToken error: " + error);
  }
};

export default genToken;