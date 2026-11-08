import Image from "next/image"
import { Eye, Layers, MessageCircle } from "lucide-react"
import { getCategoryLabel, getProductImages, type Product } from "@/lib/db/schema"
import { formatCOP } from "@/lib/format"
import { buildWhatsAppLink } from "@/lib/whatsapp"

type Props = {
  product: Product
  onClick?: () => void
}

export function ProductCard({ product, onClick }: Props) {
  const soldOut = product.stock <= 0
  const images = getProductImages(product)
  const secondaryImage = images[1]?.url ?? null

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`Ver visor de ${product.name}`}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-all duration-500 ease-out ${
                secondaryImage
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-108"
              }`}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} - Vista alterna`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="font-sans text-sm uppercase tracking-widest">Sin imagen</span>
          </div>
        )}

        {/* Badges de Stock */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-col gap-1 items-start max-w-[90%]">
          {soldOut ? (
            <span className="rounded-full bg-destructive px-2 sm:px-3 py-0.5 sm:py-1 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              Agotado
            </span>
          ) : product.stock <= 3 ? (
            <>
              <span className="rounded-md bg-amber-500 text-black px-1.5 sm:px-2 py-0.5 font-sans text-[9px] sm:text-[10px] font-black uppercase tracking-tight shadow-md">
                ¡Corre, compra la tuya!
              </span>
              <span className="rounded-full bg-black/80 text-white px-1.5 sm:px-2 py-0.5 font-sans text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                Solo {product.stock} en stock
              </span>
            </>
          ) : (
            <span className="rounded-full bg-primary px-2 sm:px-3 py-0.5 sm:py-1 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
              {product.stock} en stock
            </span>
          )}
        </div>

        {/* Indicador de múltiples ángulos si existen */}
        {images.length > 1 && (
          <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-1.5 sm:px-2 py-0.5 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
              <Layers className="size-2.5 sm:size-3 text-primary" />
              {images.length} ángulos
            </span>
          </div>
        )}

        {/* Botón flotante al pasar el mouse (sin texto) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 z-10">
          <span className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-primary/50 bg-card/95 text-primary shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Eye className="size-4 sm:size-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-1">
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {getCategoryLabel(product.category)}
          </span>
          {!soldOut && (
            <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary shrink-0">
              {product.stock} disp.
            </span>
          )}
        </div>

        <h3 className="font-sans text-xs sm:text-base font-semibold uppercase leading-snug tracking-wide text-foreground text-balance line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-tight">
            {product.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-1.5 border-t border-border/60">
          <p className="font-sans text-base sm:text-xl font-bold text-primary">
            {formatCOP(product.price)}
          </p>

          {!soldOut ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(buildWhatsAppLink({ product }), "_blank")
              }}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95 cursor-pointer touch-manipulation"
              title="Comprar directamente por WhatsApp"
            >
              <MessageCircle className="size-3.5 fill-white text-emerald-600" />
              <span>Comprar</span>
            </button>
          ) : (
            <span className="font-sans text-[11px] sm:text-xs font-bold uppercase text-destructive">
              Agotado
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
