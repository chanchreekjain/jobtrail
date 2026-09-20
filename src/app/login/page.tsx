import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen p-12 max-w-sm">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-gray-500 mb-6">
        So your pipeline follows you across devices.
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="border border-gray-400 rounded px-4 py-2 w-full hover:bg-gray-100 hover:text-black transition-colors"
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
