import { type ReactNode } from "react"
import NavMenu from "./navbar"
import { useSession } from "next-auth/react"

export default function Layout({ children }: { children: ReactNode }) {
  const { data: s } = useSession()
  return (
    <>
      <main className="-inset-4 min-h-screen bg-gradient-to-b from-transparent to-slate-300">
        {s?.user && <NavMenu />}
        {children}
      </main>
    </>
  )
}
