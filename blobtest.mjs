import { put } from "@vercel/blob"

async function tryAccess(access) {
  try {
    const blob = await put(`test/${Date.now()}-t.txt`, "hola", { access })
    console.log(`OK access=${access} ->`, blob.url)
  } catch (e) {
    console.log(`FAIL access=${access} ->`, e.message)
  }
}
await tryAccess("public")
await tryAccess("private")
