import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials.email === process.env.DEMO_EMAIL &&
          credentials.password === process.env.DEMO_PASSWORD
        ) {
          return {
            id: "demo-user",
            email: credentials.email as string,
            name: process.env.DEMO_NAME ?? "Demo User",
          };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
});
