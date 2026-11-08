import { isAdmin } from "@/lib/admin-auth"
import { getProducts } from "@/app/actions/products"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAdmin()

  if (!authed) {
    return <AdminLogin />
  }

  const products = await getProducts()
  return <AdminDashboard products={products} />
}
