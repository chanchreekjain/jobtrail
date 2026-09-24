import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    // Send unauthenticated users to our own page rather than Auth.js's
    // default one, which lists every provider generically.
    signIn: "/login",
    // Without this, anything that goes wrong during sign-in — including
    // simply cancelling at Google's screen — lands on Auth.js's own bare
    // error page, which says "server error" for something that isn't one.
    error: "/login",
  },
});
