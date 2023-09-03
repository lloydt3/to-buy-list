import { useSession } from "next-auth/react"
import React, { type FormEvent, useState } from "react"
import { api } from "~/utils/api"
import type { IIngredients } from "~/types/types"
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import Lottie from "lottie-react"
import paperPlane from "../lottie/paperPlane.json"

interface IProps {
  show?: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddIngredients(props: IProps) {
  // hooks
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false)
  const [formData, setFormData] = useState<IIngredients[]>([
    { name: "", description: "", category: "", unit: "" },
  ])

  // session
  const { data: sessionData } = useSession()

  // api
  const createIngredient = api.ingredient.createIngredient.useMutation()

  type typeField = "name" | "description" | "category" | "unit"
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
    i: number,
    field: typeField
  ) => {
    const updatedFormData = [...formData]
    updatedFormData[i]![field] = e.target.value
    setFormData(updatedFormData)
  }

  const handleAddInputs = () => {
    setFormData((prev) => [
      ...prev,
      { name: "", description: "", category: "", unit: "" },
    ])
  }

  const handleRemoveInputs = () => {
    if (formData.length === 1) {
      alert("これ以上減らせません。")
      return null
    }
    setFormData((prev) => prev.slice(0, -1))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const noCat = formData.filter((r) => r.category.length === 0)
    if (noCat.length > 0) return alert("カテゴリ選択されていない項目あります。")
    setDisableSubmit(true)
    if (formData.length === 0) {
      return alert("入力はございません。")
    }

    if (sessionData?.user.email) {
      const payload = {
        email: sessionData.user.email,
        dataArray: formData,
      }
      createIngredient
        .mutateAsync(payload)
        .then((r) => {
          console.log(r)
          setDisableSubmit(false)
          alert("追加されました。")
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
        食材・調味料などの追加
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
            <div className="mb-2 grid grid-cols-11">
              <label className="col-span-1 text-xs">No</label>
              <label className="col-span-3 text-xs">食材名</label>
              <label className="col-span-3 text-xs">詳細・メモ</label>
              <label className="col-span-2 text-xs">カテゴリ</label>
              <label className="col-span-2 text-xs">数え方</label>
            </div>
            {formData.map((data, index) => (
              <div key={index} className="m-1 grid grid-cols-11 gap-2">
                <p className="text-center text-xs ">{`${index + 1}`}</p>
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
                {/* <input
                  type="text"
                  // required
                  placeholder="例：薄切り"
                  value={data.description}
                  onChange={(e) => handleChange(e, index, "description")}
                  className="col-span-2 border-b border-slate-300 text-center focus:outline-none"
                /> */}
                <select
                  className="col-span-2 truncate border-b border-slate-300 text-center focus:outline-none"
                  value={data.category}
                  onChange={(e) => handleChange(e, index, "category")}
                >
                  <option value={""} disabled>
                    選択
                  </option>
                  <option value={"野菜"}>野菜</option>
                  <option value={"炭水化物"}>炭水化物</option>
                  <option value={"果実"}>果実</option>
                  <option value={"肉"}>肉</option>
                  <option value={"魚"}>魚</option>
                  <option value={"海鮮"}>海鮮</option>
                  <option value={"ソース"}>ソース</option>
                  <option value={"乳製品"}>乳製品</option>
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
              </div>
            ))}
            <div className="m-2 flex items-center justify-between gap-3 pt-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddInputs}
                  className="flex items-center rounded-full p-1 text-xs text-green-500 ring-1 ring-green-500"
                >
                  <PlusIcon className="w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveInputs}
                  className="flex items-center rounded-full p-1 text-xs text-pink-400 ring-1 ring-pink-400"
                >
                  <MinusIcon className="w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={disableSubmit}
                className="rounded-full px-2 py-0.5 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-10"
              >
                登録
              </button>
            </div>
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
