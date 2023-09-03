import { useRouter } from "next/router"
import { type SyntheticEvent } from "react"
import { api } from "~/utils/api"
import { HomeModernIcon } from "@heroicons/react/24/outline"
import { TRPCClientError } from "@trpc/client"

export default function SignUp() {
  const router = useRouter()
  const signUp = api.signup.signUp.useMutation()

  const handleGoback = () => {
    router.push("/").catch((e) => console.error(e))
  }

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
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

    signUp
      .mutateAsync(signUpData)
      .then((r) => {
        console.log(r)
        return router.push("/")
      })
      .catch((e) => {
        if (e instanceof TRPCClientError) {
          if (e.message === "Not authorized to register") {
            alert("登録にはアクセスコードが必要です。")
          } else alert(e.message)
        } else {
          console.error(e)
          alert("server error...")
        }
      })
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
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
            className="mx-2 w-1/2 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
            name="email"
            type="email"
            placeholder="例：tommy@google.com"
            required
          />
          <label className="mt-5 px-1 text-center text-xs">パスワード</label>
          <input
            className="mx-2 w-1/2 rounded-sm border-b border-slate-300 bg-transparent text-center placeholder:text-center focus:outline-none"
            name="password"
            type="password"
            placeholder="なるべく長く、覚えやすいもの"
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
    </div>
  )
}
