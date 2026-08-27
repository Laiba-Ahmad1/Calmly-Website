// Session/JWT helpers — get current user, role check, therapist<->patient assignment check
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@/lib/db";
import Users, { IUser } from "@/models/User";

interface DecodedToken extends JwtPayload {
  userId: string;
}

export async function getCurrentUser(): Promise<Omit<
  IUser,
  "password"
> | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string,
    ) as DecodedToken;

    await db();

    const user = await Users.findById(decoded.userId)
      .select("-password")
      .lean<Omit<IUser, "password">>();

    return user;
  } catch (err) {
    return null;
  }
}
