"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Lock, ArrowLeft } from "lucide-react"
import { loginAction } from "@/app/actions/products"

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null } as { error: string | null })

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
            La Tienda del Migue
          </span>
          <h1 className="font-sans text-2xl font-bold uppercase tracking-wide text-foreground">Panel Admin</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Ingresa la contraseña para gestionar el stock.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Contraseña de administrador"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary text-base"
          />
          {state?.error ? <p className="text-xs text-destructive text-center">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-primary px-4 py-3 font-sans font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {pending ? "Ingresando..." : "Ingresar al Panel"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border/60 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
