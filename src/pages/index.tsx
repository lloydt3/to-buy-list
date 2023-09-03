import { signIn, signOut, useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { api } from "~/utils/api"

export default function Home() {
  return (
    <>
      <Head>
        <title>ものリス</title>
        <meta name="to-buy-list" content="a grocery list" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <AuthShowcase />
      </main>
    </>
  )
}

function AuthShowcase() {
  const { data: sessionData } = useSession()

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  )

  return (
    <div className="flex flex-col items-center mb-16 justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full ring-1 ring-slate-300 text-slate-500 hover:text-white hover:bg-slate-600 bg-white/10 w-24 text-center py-2 my-2 no-underline text-sm transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "ログアウト" : "ログイン"}
      </button>
      {!sessionData && (
        <Link
          href="/auth/signUp"
          className="rounded-full ring-1 ring-slate-300 text-slate-500 hover:text-white hover:bg-slate-600 bg-white/10 w-24 text-center py-2 my-2 no-underline text-sm transition hover:bg-white/20"
        >
          登録
        </Link>
      )}
    </div>
  )
}
