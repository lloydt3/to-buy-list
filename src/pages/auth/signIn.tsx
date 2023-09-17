import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { type FormEvent, useState, useEffect } from "react"
import { HomeModernIcon } from "@heroicons/react/24/outline"
import Lottie from "lottie-react"
import paperPlane from "../../lottie/paperPlane.json"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState<Record<string, string>>({
    email: "",
    password: "",
  })

  const router = useRouter()

  const { data: sessionData } = useSession()
  if (sessionData?.user) {
    router.push("/").catch((e) => console.error(e))
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGoback = () => {
    router.push("/").catch((e) => console.error(e))
  }
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log(loginData.email, loginData.password)
    try {
      const res = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })
      if (!res) alert("サーバーエラー。")
      if (!res?.ok) {
        alert("メールまたはパスワード間違っています。")
        setLoading(false)
      } else {
        router.push("/").catch((e) => console.error(e))
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
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
            <h1 className="m-4 flex justify-center text-xl">- ログイン -</h1>
            <form
              onSubmit={handleLogin}
              className="flex flex-col items-center justify-start gap-2"
            >
              <label className="mt-5 px-1 text-center text-xs">
                メールアドレス
              </label>
              <input
                className="mx-2 w-8/12 rounded-sm border-b border-slate-300 bg-transparent text-center text-sm placeholder:text-center focus:outline-none"
                name="email"
                type="email"
                placeholder="例：tommy@google.com"
                onChange={handleFormChange}
                required
              />
              <label className="mt-5 px-1 text-center text-xs">
                パスワード
              </label>
              <input
                className="mx-2 w-8/12 rounded-sm border-b border-slate-300 bg-transparent text-center text-sm placeholder:text-center focus:outline-none"
                name="password"
                type="password"
                onChange={handleFormChange}
                required
              />
              <button
                type="submit"
                className="mx-4 my-8 rounded-full px-2 py-1 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white"
              >
                Login
              </button>
            </form>
          </div>
          <div>
            <button
              className="mx-4 my-8 rounded-full px-2 py-1 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white"
              onClick={() => router.push("/auth/signUp")}
            >
              アカウント作成
            </button>
          </div>
          <button type="button" onClick={handleGoback} className="mb-24 mt-10">
            <HomeModernIcon className="h-8 w-8 text-slate-500 transition-all hover:scale-105 hover:text-pink-500" />
          </button>
        </>
      )}
    </div>
  )
}
