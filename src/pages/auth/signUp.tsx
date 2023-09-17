import { useRouter } from "next/router"
import { useState, type SyntheticEvent } from "react"
import { api } from "~/utils/api"
import { HomeModernIcon } from "@heroicons/react/24/outline"
import { TRPCClientError } from "@trpc/client"
import { signIn } from "next-auth/react"
import Lottie from "lottie-react"
import paperPlane from "../../lottie/paperPlane.json"

export default function SignUp() {
  const router = useRouter()
  const signUp = api.signup.signUp.useMutation()

  const [loading, setLoading] = useState(false)

  const handleGoback = () => {
    router.push("/").catch((e) => console.error(e))
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const target = e.target as typeof e.target & {
        username: { value: string }
        email: { value: string }
        password: { value: string }
        accessCode: { value: string }
      }
      const signUpData = {
        name: target.username.value,
        email: target.email.value,
        password: target.password.value,
        accessCode: target.accessCode.value,
      }
      const res = await signUp.mutateAsync(signUpData)
      if (!res) throw new Error("error")
      try {
        const signin = await signIn("credentials", {
          email: target.email.value,
          password: target.password.value,
          redirect: false,
        })
        if (!signin) alert("サーバーエラー。")
      } catch (e) {
        alert("ユーザ登録成功。自動ログインエラ。ホーム画面でログインして下さい。")
      }
      return router.push("/")
    } catch (e) {
      if (e instanceof TRPCClientError)
        if (e.message === "Not authorized to register")
          alert("登録にはアクセスコードが必要です。")
        else {
          alert(e.message)
        }
    }
    setLoading(false)
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {loading ? (
        <div className="-mt-52">
          <Lottie animationData={paperPlane} />
          <p className="-mt-20 flex justify-center bg-gradient-to-b from-indigo-600 to-pink-600 bg-clip-text text-center font-bold text-transparent">
            送信中
          </p>
        </div>
      ) : (
        <>
          <div className="container max-w-xs rounded-3xl p-3 outline outline-1 outline-slate-300 md:max-w-md">
            <h1 className="m-4 flex justify-center text-xl">
              - アカウント作成作成 -
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-start gap-2 "
            >
              <label className="mt-5 px-1 text-center text-xs">ユーザ</label>
              <input
                className="mx-2 w-1/2 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
                name="username"
                type="text"
                placeholder="例：とみー"
                required
              />
              <label className="mt-5 px-1 text-center text-xs focus:outline-none">
                メール
              </label>
              <input
                className="mx-2 w-2/3 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
                name="email"
                type="email"
                placeholder="例：name@email.com"
                required
              />
              <label className="mt-5 px-1 text-center text-xs">
                パスワード
              </label>
              <input
                className="mx-2 w-1/2 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
                name="password"
                type="password"
                placeholder="なるべく長く"
                required
              />
              <label className="mt-5 px-1 text-center text-xs">
                アクセスコード
              </label>
              <input
                className="mx-2 w-1/2 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
                name="accessCode"
                type="text"
                placeholder="登録用コード"
                required
              />
              <button
                className="mx-4 my-8 rounded-full px-2 py-1 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                type="submit"
              >
                登録
              </button>
            </form>
          </div>
          <button type="button" onClick={handleGoback} className="mt-10">
            <HomeModernIcon className="h-8 w-8 text-slate-500 transition-all hover:scale-105 hover:text-pink-500" />
          </button>
        </>
      )}
    </div>
  )
}
