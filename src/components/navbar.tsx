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
      {/* <div className="fixed top-0 z-50 hidden h-12 min-w-full shadow-md md:block">
        <Link href={"/auth/signIn"}>ログイン</Link>
        <Link href={"/"}>ホーム</Link>
      </div> */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 ">
        <button
          className="h-12 w-12 rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-slate-300 shadow-sm shadow-black transition-all active:scale-95"
          onClick={() => setShowNav((prev) => !prev)}
        >
          <Squares2X2Icon />
        </button>
      </div>
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-28 z-50 flex w-full justify-center"
          >
            <div className="grid grid-cols-3 gap-6 rounded-2xl bg-slate-600/30 p-5">
              {/* <div className="mx-auto flex flex-col items-center justify-center rounded-2xl bg-black/70"> */}
              {/* <div className="m-auto flex flex-col items-center justify-center gap-6 p-5"> */}
              {sessionData?.user && (
                <>
                  <Link
                    onClick={() => setShowNav(false)}
                    href="/menu"
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-center text-xs font-bold text-slate-300 shadow-sm shadow-black transition-all hover:scale-105 active:scale-95 md:text-base"
                  >
                    <p>料理</p>
                    <p>メニュ</p>
                  </Link>
                  <Link
                    onClick={() => setShowNav(false)}
                    href="/"
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-center text-xs font-bold text-slate-300 shadow-sm shadow-black transition-all hover:scale-105 active:scale-95 md:text-base"
                  >
                    <p>買い物</p>
                    <p>リスト</p>
                  </Link>
                  <Link
                    onClick={() => setShowNav(false)}
                    href="/menu/addMenu"
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-center text-xs font-bold text-slate-300 shadow-sm shadow-black transition-all hover:scale-105 active:scale-95 md:text-base"
                  >
                    <p>材料追加</p>
                    <p></p>
                  </Link>
                </>
              )}
              {sessionData?.user ? (
                <button
                  onClick={() => signOut()}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-sky-950 to-sky-600 text-center text-xs font-bold text-slate-300 shadow-sm shadow-black transition-all hover:scale-105 active:scale-95 md:text-base"
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
              {/* </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
