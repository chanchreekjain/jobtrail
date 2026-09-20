import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    // Send unauthenticated users to our own page rather than Auth.js's
    // default one, which lists every provider generically.
    signIn: "/login",
  },
});
