import { useSession } from "next-auth/react"
import React, { type FormEvent, useState, useEffect } from "react"
import { api } from "~/utils/api"
import type { IEditIngredients } from "~/types/types"
import Lottie from "lottie-react"
import paperPlane from "../lottie/paperPlane.json"

interface IProps {
  show?: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EditIngredients(props: IProps) {
  // hooks
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false)
  const [formData, setFormData] = useState<IEditIngredients[]>([])
  const [editsId, setEditsId] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string[]>([])

  // session
  const { data: sessionData } = useSession()

  // api
  const editIngredient = api.ingredient.editIngredient.useMutation()
  const savedIngredients = api.ingredient.getIngredients.useQuery(
    { email: sessionData?.user.email ?? "" },
    { enabled: false }
  )

  // effects that i really hate
  useEffect(() => {
    if (sessionData) {
      savedIngredients
        .refetch()
        .then((res) => {
          if (res.data) {
            setFormData(res.data?.data)
          }
        })
        .catch((e) => console.error(e))
    }
  }, [sessionData])

  type typeField = "id" | "name" | "description" | "category" | "unit"
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
    i: number,
    field: typeField
  ) => {
    const updatedFormData = [...formData]
    updatedFormData[i]![field] = e.target.value
    const id = updatedFormData[i]!.id
    if (id !== undefined && !editsId.includes(id)) {
      setEditsId((prev) => [...prev, id])
    }
    setFormData(updatedFormData)
  }

  const handleDelete = (index: number, id: string) => {
    const updatedFormData = formData.filter((item, i) => i !== index)
    setFormData(updatedFormData)
    setDeleteId((prev) => [...prev, id])
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const noCat = formData.filter((r) => r.category.length === 0)
    if (noCat.length > 0) return alert("カテゴリ選択されていない項目あります。")
    setDisableSubmit(true)
    if (formData.length === 0) {
      return alert("入力はございません。")
    }

    const ingredients2edit = formData.filter((item) =>
      editsId.includes(item.id)
    )

    if (sessionData?.user.email) {
      const payload = {
        email: sessionData.user.email,
        dataArray: ingredients2edit,
        deleteArray: deleteId,
      }
      editIngredient
        .mutateAsync(payload)
        .then((r) => {
          console.log(r)
          setDisableSubmit(false)
          alert("処理されました。")
          props.setShow(false)
        })
        .catch((e) => console.error(e))
    }
  }
  return (
    <div
      id="add new ingredients"
      className="fixed inset-0 bg-gradient-to-t from-slate-200 to-white p-2"
    >
      <h1 className="my-5 flex justify-center bg-gradient-to-r from-violet-700 to-pink-500 bg-clip-text px-2 text-center text-xl font-bold text-transparent">
        食材・調味料などの編集
      </h1>

      {sessionData ? (
        disableSubmit ? (
          <div>
            <Lottie animationData={paperPlane} />
            <p className="-mt-20 flex items-center justify-center bg-gradient-to-b from-indigo-600 to-pink-600 bg-clip-text text-center font-bold text-transparent">
              送信中
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="text-center text-sm">
            <div className="mb-2 grid grid-cols-12">
              <label className="col-span-1 text-xs">No</label>
              <label className="col-span-3 text-xs">食材名</label>
              <label className="col-span-3 text-xs">詳細・メモ</label>
              <label className="col-span-2 text-xs">カテゴリ</label>
              <label className="col-span-2 text-xs">数え方</label>
            </div>
            {formData.map((data, index) => (
              <div
                key={index}
                className="m-1 my-2 grid grid-cols-12 gap-1 text-xs"
              >
                <p className="truncate text-center text-xs">{`${index + 1}`}</p>
                <input
                  type="text"
                  required
                  placeholder="例：豚肉"
                  value={data.name}
                  onChange={(e) => handleChange(e, index, "name")}
                  className="col-span-3 truncate border-b border-slate-300 text-center focus:outline-none"
                />
                <input
                  type="text"
                  // required
                  placeholder="例：薄切り"
                  value={data.description}
                  onChange={(e) => handleChange(e, index, "description")}
                  className="col-span-3 truncate border-b border-slate-300 text-center focus:outline-none"
                />
                <select
                  className="col-span-2 truncate border-b border-slate-300 text-center focus:outline-none"
                  value={data.category}
                  onChange={(e) => handleChange(e, index, "category")}
                >
                  <option value={"野菜"}>野菜</option>
                  <option value={"炭水化物"}>炭水化物</option>
                  <option value={"果実"}>果実</option>
                  <option value={"肉"}>肉</option>
                  <option value={"魚"}>魚</option>
                  <option value={"海鮮"}>海鮮</option>
                  <option value={"乳製品"}>乳製品</option>
                  <option value={"ソース"}>ソース</option>
                  <option value={"調味料"}>調味料</option>
                  <option value={"その他"}>その他</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="例：g"
                  value={data.unit}
                  onChange={(e) => handleChange(e, index, "unit")}
                  className="col-span-2 border-b border-slate-300 text-center focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(index, data.id)}
                  className="rounded-full text-[8px] text-red-400 ring-1 ring-red-400"
                >
                  削
                </button>
              </div>
            ))}
            <button
              type="submit"
              disabled={disableSubmit}
              className="m-3 rounded-full px-2 py-0.5 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-10"
            >
              登録
            </button>
          </form>
        )
      ) : (
        <div>ログインしてください！</div>
      )}
      <button
        onClick={() => props.setShow(false)}
        className="fixed inset-x-0 bottom-5 flex"
      >
        <p className="mx-auto rounded-full p-2 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-10">
          閉じる
        </p>
      </button>
    </div>
  )
}
