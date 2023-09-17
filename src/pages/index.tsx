import { useSession } from "next-auth/react"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { api } from "~/utils/api"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
  ArrowUturnLeftIcon,
  ClipboardDocumentIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline"

export default function Home() {
  const router = useRouter()
  const { data: sessionData, status: sessionStatus } = useSession()

  const toBuyList = api.toBuyList.getToBuyList.useQuery(
    { email: sessionData?.user.email ?? "" },
    { enabled: sessionStatus === "authenticated" }
  )
  const toBuyListName = api.toBuyList.getToBuyListName.useQuery(
    { email: sessionData?.user.email ?? "" },
    { enabled: sessionStatus === "authenticated" }
  )
  const createItem = api.toBuyList.createToBuyItem.useMutation()
  const updateItemStatus = api.toBuyList.updateToBuyListStatus.useMutation()

  const [listName, setListName] = useState<string | null>(null)
  const [createListName, setCreateListName] = useState("")

  useEffect(() => {
    console.log(sessionStatus)
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signIn").catch((e) => console.error(e))
    }
  }, [router, sessionStatus])

  const formik = useFormik({
    initialValues: {
      name: "",
      count: "1",
      status: "new",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(20, "20文字庵内").required("入力はございません。"),
      count: Yup.string().max(10).required("数を入力してください。"),
    }),
    onSubmit: (values) => {
      if (sessionData?.user.email && listName) {
        createItem
          .mutateAsync({
            ...values,
            listName: listName,
            createdByUserEmail: sessionData?.user.email,
          })
          .then(() => {
            formik.resetForm()
          })
          .then(() => {
            toBuyList.refetch().catch((e) => console.error(e))
          })
          .catch((e) => console.error(e))
      }
    },
  })

  const handleLogCart = (id: string) => {
    updateItemStatus
      .mutateAsync({ id: id, status: "done" })
      .then(() => toBuyList.refetch())
      .catch((e) => console.error(e))
  }
  const handleUnlogCart = (id: string) => {
    updateItemStatus
      .mutateAsync({ id: id, status: "new" })
      .then(() => toBuyList.refetch())
      .catch((e) => console.error(e))
  }
  console.log(formik.errors)

  return (
    <>
      <Head>
        <title>ものリス</title>
        <meta name="to-buy-list" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="static min-h-screen">
        {sessionStatus === "authenticated" && !listName && (
          <div className="mx-auto mt-10 text-sm">
            <h1 className="flex items-center justify-center text-lg">
              リスト選択
            </h1>
            {toBuyListName.data && toBuyListName.data?.length > 0 ? (
              toBuyListName.data.map((r) => (
                <div
                  className="flex flex-col items-center justify-center text-center"
                  key={r.listName}
                >
                  <button
                    onClick={() => setListName(r.listName)}
                    className="my-2 w-40 rounded-full bg-gradient-to-tr from-sky-950 to-sky-600 p-1 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    {r.listName}
                  </button>
                </div>
              ))
            ) : (
              <p className="mt-5 flex justify-center text-center">
                リスト作成してください。
              </p>
            )}
            <div className="mt-5 flex items-center justify-center gap-5">
              <input
                value={createListName}
                placeholder="例：9/17買い物"
                onChange={(e) => setCreateListName(e.target.value)}
                className="w-40 rounded-lg bg-slate-100 px-2 py-0.5 text-center outline-none ring-1 ring-slate-300 transition-all focus:bg-white focus:ring-indigo-400"
              />
              <button
                onClick={() => setListName(createListName)}
                className="rounded-full bg-black/10 px-2 py-1 text-xs"
              >
                リスト作成
              </button>
            </div>
          </div>
        )}
        {sessionStatus === "authenticated" && !!listName && (
          <>
            <div className="mx-auto mt-5">
              <div className="mb-3 flex items-center justify-between">
                <button
                  className="mx-5 rounded-full p-1 text-xs"
                  onClick={() => setListName(null)}
                >
                  <ArrowUturnLeftIcon className="w-5" />
                </button>
                <div className="mx-5 flex items-center justify-center gap-2">
                  <ClipboardDocumentIcon className="w-5" />
                  <p>{listName}</p>
                </div>
              </div>
              <div className="mx-5 my-2 grid grid-cols-10 border-b-[0.5px] border-slate-700 text-sm">
                <p className="mx-2 ">No.</p>
                <p className="col-span-5 mx-2">品名</p>
                <p className="col-span-2 mx-2 text-center">数</p>
                <p className="col-span-2 flex justify-center">
                  <ShoppingCartIcon className="w-5" />
                </p>
              </div>
            </div>
            <div className="mx-auto max-h-[450px] overflow-auto">
              {toBuyList.data?.res
                ?.filter((r) => r.listName === listName)
                .map((r, i) => (
                  <div key={r.name} className="mx-5 grid grid-cols-10 text-sm">
                    <p className="mx-2 mt-0.5 text-center">{i + 1}</p>
                    <p
                      className={`col-span-5 mx-2 mt-0.5 decoration-pink-500 ${
                        r.status === "done" && "line-through"
                      }`}
                    >
                      {r.name}
                    </p>
                    <p className="col-span-2 mx-2 mt-0.5 text-center">
                      {r.count}
                    </p>
                    {r.status === "new" ? (
                      <button
                        className="col-span-2 m-0.5 rounded-full bg-black/10"
                        onClick={() => handleLogCart(r.id)}
                      >
                        未
                      </button>
                    ) : (
                      <button
                        className="col-span-2 m-0.5 rounded-full bg-slate-700 text-white"
                        onClick={() => handleUnlogCart(r.id)}
                      >
                        済
                      </button>
                    )}
                  </div>
                ))}
            </div>
            <div className="absolute bottom-20 w-full items-center justify-center ">
              <form
                onSubmit={formik.handleSubmit}
                className="mx-5 my-5 grid grid-cols-10 items-center"
              >
                <label className="pr-1 text-end text-xs text-slate-600">
                  名称
                </label>
                <input
                  className="col-span-5 rounded-md bg-slate-50 px-2 py-1 text-center text-xs focus:bg-white focus:outline-none"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  placeholder="例：カップラーメン"
                  name="name"
                  autoComplete="off"
                />

                <label className="pr-1 text-end text-xs text-slate-600">
                  数
                </label>
                <input
                  className="rounded-md bg-slate-50 px-2 py-1 text-center text-xs focus:bg-white focus:outline-none"
                  onChange={formik.handleChange}
                  name="count"
                  value={formik.values.count}
                />
                <button type="submit" className="col-span-2 text-sm">
                  追加
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </>
  )
}
