import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

/** Signs a JWT containing the authenticated user's ID. */
export const generateAccessToken = (
    userId: string
) => {
    return jwt.sign(
        {
            userId,
        },
        JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );
};