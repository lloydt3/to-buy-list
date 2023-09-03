import { useSession } from "next-auth/react"
import Head from "next/head"
import { api } from "~/utils/api"
import type { IMenuIngredient, IPlannedMenu } from "~/types/types"
import React, { type FormEvent, Fragment, useEffect, useState } from "react"
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import Lottie from "lottie-react"
import paperPlane from "../../lottie/paperPlane.json"

export default function Menu() {
  // session
  const { data: sessionData } = useSession()

  // api
  const recipes = api.recipe.getRecipe.useQuery(
    { email: sessionData?.user.email ?? "" },
    { enabled: sessionData?.user !== undefined }
  )
  const createSchedule = api.menuSchedule.createSchedule.useMutation()

  // hooks
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false)
  const [ingredients, setIngredients] = useState<IMenuIngredient[]>([])
  const [menus, setMenus] = useState<IPlannedMenu[]>([
    { id: "", name: "", description: "", category: "" },
    { id: "", name: "", description: "", category: "" },
    { id: "", name: "", description: "", category: "" },
  ])

  // timestamp
  const dateNow = new Date().toISOString().split("T")[0]

  // effects
  useEffect(() => {
    const menuIds = menus.map((menu) => menu.id).filter((id) => id !== "")
    const newIngredients = menuIds
      .map((menuId) => {
        const res = recipes.data?.data
          .filter((recipe) => recipe.id === menuId)
          .map((filtered) => {
            const temp: IMenuIngredient[] = filtered.recipeIngredient.map(
              (f) => ({
                id: f.ingredient.id,
                name: f.ingredient.name,
                description: f.ingredient.description,
                quantity: f.quantity,
                unit: f.ingredient.unit,
              })
            )
            return temp
          })

        const res2 = res!.flatMap((r) => r)
        return res2
      })
      .flatMap((r) => r)

    const combined = newIngredients.reduce((acc, item) => {
      const existing = acc.find((e) => e.id === item.id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        acc.push({ ...item })
      }
      return acc
    }, [] as IMenuIngredient[])
    setIngredients(combined)
  }, [menus, recipes.data])

  // handlers
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>, i: number) => {
    const newMenus = [...menus]
    const menuSelected = recipes.data?.data.filter(
      (item) => item.id === e.target.value
    )[0]
    newMenus[i] = {
      id: e.target.value,
      name: menuSelected!.title,
      description: menuSelected?.description ?? "",
      category: menuSelected?.category ?? "",
    }
    setMenus(newMenus)
  }

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => {
    const day = e.target.valueAsDate ?? new Date()
    const temp = menus.map((item, index) => {
      if (index === i) {
        item.day = day
      }
      return item
    })
    setMenus(temp)
  }

  const handleAddMenu = () => {
    setMenus((prev) => [
      ...prev,
      { id: "", name: "", description: "", category: "" },
    ])
  }

  const handleRemoveMenu = () => {
    setMenus(menus.slice(0, -1))
  }

  const handleSubmitMenu = (e: FormEvent) => {
    e.preventDefault()
    setDisableSubmit(true)
    console.log("submit clicked")
    console.log()

    if (sessionData?.user.email) {
      const payload = {
        email: sessionData.user.email,
        schedule: menus
          .map((item) => ({
            id: item.id,
            day: item.day!,
          })),
      }
      console.log(payload)
      createSchedule
        .mutateAsync(payload)
        .then((r) => {
          console.log(r)
          alert("追加されました。")
        })
        .catch((e) => console.error(e))
    }
    setDisableSubmit(false)
  }

  return (
    <div>
      <Head>
        <title>メニュ追加</title>
        <meta name="メニュ" content="メニュ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative mx-auto mt-5 flex min-h-screen flex-col items-center">
        <div>メニュ</div>
        <div className="mx-2 mt-2 flex max-w-sm items-center justify-end gap-3 pb-1 text-xs sm:mx-auto">
          <div className="mx-7 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleAddMenu}
              className="flex items-center "
            >
              項目増やす <PlusCircleIcon className="h-5 w-5 text-green-500" />
            </button>
            <button
              type="button"
              onClick={handleRemoveMenu}
              className="flex items-center "
            >
              減らす <MinusCircleIcon className="h-5 w-5 text-pink-400" />
            </button>
          </div>
        </div>
        {sessionData?.user !== undefined ? (
          disableSubmit ? (
            <div>
              <Lottie animationData={paperPlane} />
              <p className="-mt-20 flex items-center justify-center bg-gradient-to-b from-indigo-600 to-pink-600 bg-clip-text text-center font-bold text-transparent">
                送信中
              </p>
            </div>
          ) : (
            <div className="min-w-full items-center justify-center p-2">
              <form
                className="grid grid-cols-7 gap-1 text-center text-xs"
                onSubmit={handleSubmitMenu}
              >
                {menus.map((menu, index) => (
                  <Fragment key={index}>
                    <p>No. {index + 1}</p>
                    <select
                      key={index}
                      value={menu.id}
                      onChange={(e) => handleChange(e, index)}
                      className="col-span-4"
                    >
                      <option value="" disabled>
                        選択して下さい
                      </option>
                      {recipes.data?.data.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.title}({recipe.description})
                        </option>
                      ))}
                    </select>
                    <input
                      className="col-span-2"
                      type="date"
                      min={dateNow}
                      required
                      onChange={(e) => handleDateChange(e, index)}
                    />
                  </Fragment>
                ))}
                <button
                  type="submit"
                  disabled={disableSubmit}
                  className="col-start-4 col-end-5 my-2 rounded-full px-2 py-0.5 text-sm text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-10"
                >
                  登録
                </button>
              </form>
              <h1 className="mb-3 mt-10 text-center">食材など</h1>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {ingredients.map((item, i) => (
                  <Fragment key={item.id}>
                    <p>No. {i + 1}</p>
                    <p className="col-span-4 text-start">
                      {item.name}（{item.description}）
                    </p>
                    <p className="col-span-2">
                      {item.quantity}
                      {item.unit}
                    </p>
                  </Fragment>
                ))}
              </div>
            </div>
          )
        ) : (
          <div>ログインして下さい。</div>
        )}
      </main>
    </div>
  )
}
