import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!,
);

const algorithm = "HS256";

export interface PlatformSessionPayload
  extends JWTPayload {

  userId: string;

  email: string;

  role: string;

}

export async function signPlatformJwt(
  payload: PlatformSessionPayload,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: algorithm,
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyPlatformJwt(
  token: string,
) {
  const { payload } =
    await jwtVerify(token, secret);

  return payload as PlatformSessionPayload;
}