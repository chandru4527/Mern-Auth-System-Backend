import jwt from "jsonwebtoken";

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

// Generate access token (expires in 15 minutes)
export const generateAccessToken = (userId) => {
    if (!JWT_ACCESS_TOKEN_SECRET) {
        throw new Error("Jwt access token is not configured");
    }

    return jwt.sign(
        {
            sub: userId.toString(),
            type: "access",
        },
        JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

// Generate refresh token (expires in 7 days)
export const generateRefreshToken = (userId) => {
    if (!JWT_REFRESH_TOKEN_SECRET) {
        throw new Error("Jwt refresh token is not configured");
    }

    return jwt.sign({
        sub: userId.toString(),
        type: "refresh",
    },
        JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};