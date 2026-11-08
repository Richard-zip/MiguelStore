import Link from "next/link"
import { Lock, ShieldCheck, Sparkles, BadgeCheck, Shirt, Wallet, Crown, MessageCircle } from "lucide-react"
import { getProducts } from "./actions/products"
import { CatalogGrid } from "@/components/catalog-grid"
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

export default async function CatalogPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-3.5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-2">
          <span className="font-sans text-base font-bold uppercase tracking-wider text-foreground sm:text-xl">
            La Tienda <span className="text-primary">del Migue</span>
          </span>
          <span className="hidden text-xs text-muted-foreground md:inline-block">
            • Gorras · Billeteras · Camisetas
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 sm:px-3 sm:py-2 font-sans text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-emerald-500 hover:text-emerald-500"
            title={`Chatear por WhatsApp al +57 ${WHATSAPP_DISPLAY}`}
          >
            <MessageCircle className="size-3.5 fill-emerald-600 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 sm:px-3 sm:py-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Lock className="size-3.5" />
            <span className="text-xs">Admin</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card/40 to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:gap-6 px-4 py-8 sm:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="size-3.5" />
            Nueva Colección Disponible
          </span>

          <h1 className="font-sans text-3xl font-extrabold uppercase leading-none tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl">
            La Tienda <span className="text-primary">del Migue</span>
          </h1>

          <p className="font-sans text-sm sm:text-base font-semibold uppercase tracking-widest text-primary">
            Gorras • Billeteras • Camisetas
          </p>

          <p className="max-w-2xl text-pretty text-xs sm:text-base text-muted-foreground px-2">
            Diseños únicos para cualquier ocasión. Ajuste cómodo, excelente acabado y los complementos perfectos para tu
            outfit. Viste diferente, marca tu estilo.
          </p>

          {/* Category badges */}
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-sm pt-1 sm:max-w-none sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border bg-card/60 px-2 py-2 sm:px-4 sm:py-2 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground text-center">
              <Crown className="size-3.5 text-primary" />
              <span>Gorras</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border bg-card/60 px-2 py-2 sm:px-4 sm:py-2 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground text-center">
              <Wallet className="size-3.5 text-primary" />
              <span>Billeteras</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border bg-card/60 px-2 py-2 sm:px-4 sm:py-2 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground text-center">
              <Shirt className="size-3.5 text-primary" />
              <span>Camisetas</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 w-full max-w-3xl">
            <Feature icon={<BadgeCheck className="size-4" />} text="Calidad premium garantizada" />
            <Feature icon={<Sparkles className="size-4" />} text="Modelos exclusivos" />
            <Feature icon={<ShieldCheck className="size-4" />} text="Envíos a toda Colombia" />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-6xl px-3.5 py-8 sm:px-8 sm:py-12">
        <CatalogGrid products={products} />
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <p className="font-sans uppercase tracking-widest font-semibold text-foreground">
          La Tienda del Migue — Gorras · Billeteras · Camisetas
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_PHONE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          <MessageCircle className="size-4 fill-emerald-600 text-emerald-600" />
          Pedidos & Atención WhatsApp: <strong className="text-foreground">+{WHATSAPP_DISPLAY}</strong>
        </a>
      </footer>
    </main>
  )
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-primary">{icon}</span>
      <span className="font-sans text-sm font-medium uppercase tracking-wide text-foreground">{text}</span>
    </div>
  )
}
