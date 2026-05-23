import { comparePassword, setSessionCookie, signToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    await connectToDatabase();

    const user = await User.findOne({ email: body.email.toLowerCase() });

    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const isPasswordValid = await comparePassword(body.password, user.password);

    if (!isPasswordValid) {
      return jsonError("Invalid email or password.", 401);
    }

    const sessionUser = {
      id: String(user._id),
      name: user.name,
      email: user.email
    };

    await setSessionCookie(signToken(sessionUser));
    return jsonOk(sessionUser);
  } catch (error) {
    return handleApiError(error);
  }
}
