import { Squares2X2Icon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { signOut, useSession } from "next-auth/react"

export default function NavMenu() {
  const [showNav, setShowNav] = useState<boolean>(false)
  const { data: sessionData } = useSession()
  return (
    <>
      <div className="fixed top-0 z-50 hidden h-12 min-w-full shadow-md sm:block">
        <Link href={"/auth/signIn"}>ログイン</Link>
        <Link href={"/"}>ホーム</Link>
      </div>
      <div className="fixed bottom-2 left-1/2 z-50 -translate-x-1/2 sm:hidden">
        <button
          className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-slate-300 shadow-sm shadow-black transition-all active:scale-95"
          onClick={() => setShowNav((prev) => !prev)}
        >
          <Squares2X2Icon />
        </button>
      </div>
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="fixed bottom-20 z-50 flex w-full justify-center"
          >
            <div className="mx-auto flex flex-col items-center justify-center rounded-2xl bg-black/70">
              <div className="m-auto flex items-center justify-center gap-6 p-5">
                {sessionData?.user && (
                  <>
                    <Link
                      onClick={() => setShowNav(false)}
                      href="/menu"
                      className="flex h-16 w-16 flex-col items-center justify-center rounded-xl text-center text-xs text-white ring-1 ring-slate-300 hover:bg-yellow-400 hover:text-gray-700"
                    >
                      <p>料理</p>
                      <p>メニュ</p>
                    </Link>
                    <Link
                      onClick={() => setShowNav(false)}
                      href="/"
                      className="flex h-16 w-16 flex-col items-center justify-center rounded-xl text-center text-xs text-white ring-1 ring-slate-300 hover:bg-yellow-400 hover:text-gray-700"
                    >
                      <p>買い物</p>
                      <p>リスト</p>
                    </Link>
                  </>
                )}
                {sessionData?.user ? (
                  <button
                    onClick={() => signOut()}
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-center text-xs text-white ring-1 ring-slate-300 hover:bg-yellow-400 hover:text-gray-700"
                  >
                    ログアウト
                  </button>
                ) : (
                  <Link
                    onClick={() => setShowNav(false)}
                    href={"/auth/signIn"}
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-center text-xs text-white ring-1 ring-slate-300 hover:bg-yellow-400 hover:text-gray-700"
                  >
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
