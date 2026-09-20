import { handlers } from "@/auth";

// Auth.js owns every URL under /api/auth/* — sign in, callbacks, sign out,
// session. The [...nextauth] catch-all is what hands them all to it.
export const { GET, POST } = handlers;
