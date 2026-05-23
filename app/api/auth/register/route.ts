import { connectToDatabase } from "@/lib/db";
import { hashPassword, setSessionCookie, signToken } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    await connectToDatabase();

    const existingUser = await User.findOne({ email: body.email.toLowerCase() });

    if (existingUser) {
      return jsonError("An account with this email already exists.", 409);
    }

    const password = await hashPassword(body.password);
    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      password
    });

    const sessionUser = {
      id: String(user._id),
      name: user.name,
      email: user.email
    };

    await setSessionCookie(signToken(sessionUser));
    return jsonOk(sessionUser, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
