"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";

const COPY = {
  login: {
    title: "Log in",
    button: "Log in",
    pending: "Logging in…",
    switchText: "No account yet?",
    switchLink: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    button: "Sign up",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/login",
  },
};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : signup,
    {},
  );
  const copy = COPY[mode];

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface p-8">
        <p className="mb-1 text-sm text-muted">Course Tracker</p>
        <h1 className="mb-6 text-2xl font-semibold">{copy.title}</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              className="rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>

          {state.error && (
            <p role="alert" className="text-sm text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-3 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? copy.pending : copy.button}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          {copy.switchText}{" "}
          <Link href={copy.switchHref} className="text-accent hover:underline">
            {copy.switchLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
