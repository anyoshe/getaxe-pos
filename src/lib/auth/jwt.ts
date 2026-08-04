import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

const algorithm = "HS256";

export interface SessionPayload extends JWTPayload {
  userId: string;
  businessId: string;
  roleId: string;
  email: string;
}

export async function signJwt(
  payload: SessionPayload,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: algorithm,
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyJwt(
  token: string,
) {
  const { payload } =
    await jwtVerify(token, secret);

  return payload as SessionPayload;
}