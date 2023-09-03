import Head from "next/head"
import { type FormEvent, useEffect, useState } from "react"
import AddIngredients from "~/components/addIngredients"
import EditIngredients from "~/components/editIngredients"
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline"
import type { IMenu, IMenuIngredient } from "~/types/types"
import { useSession } from "next-auth/react"
import { api } from "~/utils/api"
import { useRouter } from "next/router"

export default function AddMenu() {
  const router = useRouter()

  // sesssion
  const { data: sessionData } = useSession()

  // hooks
  const [enableApi, setEnableApi] = useState(false)
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [showAddIngreButton, setShowAddIngreButton] = useState(false)
  const [showEditIngreButton, setShowEditIngreButton] = useState(false)
  const [menuIngredient, setMenuIngredient] = useState<IMenuIngredient[]>([
    { id: "", name: "", unit:"", description: "", quantity: 1 },
  ])
  const [menuName, setMenuName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [category, setCategory] = useState<string>("")

  // api
  const ingredientList = api.ingredient.getIngredients.useQuery(
    { email: sessionData?.user.email ?? "" },
    { enabled: enableApi }
  )
  const createRecipe = api.recipe.createRecipe.useMutation()

  // effects that i really hate
  useEffect(() => {
    if (sessionData) setEnableApi(true)
    else setEnableApi(false)
  }, [sessionData])

  // handlers
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    setDisableSubmit(true)

    const emptyInputs = menuIngredient.filter(
      (item) => item.name === "" || item.quantity === 0
    )
    if (emptyInputs.length > 0) {
      alert("入力されない欄あります。")
      return setDisableSubmit(false)
    }
    const recipe = {
      name: menuName,
      description: description,
      category: category,
    }

    const menuIngredientForPayload = menuIngredient.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))

    if (sessionData?.user.email) {
      const payload = {
        email: sessionData.user.email,
        recipe: recipe,
        ingredients: menuIngredientForPayload,
      }
      console.log(payload)
      createRecipe
        .mutateAsync(payload)
        .then(() => {
          alert("登録しました！")
          router.push("/menu").catch((e) => console.error(e))
        })
        .catch((e) => console.error(e))
    }
    setDisableSubmit(false)
  }

  type typeField = "id" | "name" | "quantity"
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
    i: number,
    field: typeField
  ) => {
    const updatedMenuIngredient = [...menuIngredient]
    if (field === "quantity") {
      updatedMenuIngredient[i]![field] = parseFloat(e.target.value)
    } else {
      updatedMenuIngredient[i]!.id = e.target.value
      const a = ingredientList.data!.data.filter(
        (item) => item.id === e.target.value
      )[0]!.name
      updatedMenuIngredient[i]![field] = a
    }
    setMenuIngredient(updatedMenuIngredient)
  }

  const handleAddInputs = () => {
    setMenuIngredient((prev) => [
      ...prev,
      { id: "", name: "", unit: "", description: "", quantity: 1 },
    ])
  }

  const handleRemoveInputs = () => {
    if (menuIngredient.length === 1) {
      alert("これ以上減らせません。")
      return null
    }
    setMenuIngredient((prev) => prev.slice(0, -1))
  }

  return (
    <>
      <Head>
        <title>メニュ追加</title>
        <meta name="メニュを追加" content="メニュ追加" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <button onClick={() => setShowAddIngreButton((prev) => !prev)}>
          食材追加
        </button>
        {showAddIngreButton && (
          <AddIngredients setShow={setShowAddIngreButton} />
        )}

        <button onClick={() => setShowEditIngreButton((prev) => !prev)}>
          食材編集
        </button>
        {showEditIngreButton && (
          <EditIngredients setShow={setShowEditIngreButton} />
        )}

        <div className="w-full">
          <h1 className="flex justify-center">メニュ登録</h1>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col text-center text-sm"
          >
            <label className="mt-3 text-xs">料理名</label>
            <input
              type="text"
              required
              placeholder="ジャーマンポテト"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="mx-auto w-10/12 max-w-sm border-b border-slate-300 p-1 text-center focus:outline-none"
            />
            <label className="mt-3 text-xs">詳細・作り方・メモ</label>
            <textarea
              rows={1}
              required
              placeholder="めっちゃ美味しい"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mx-auto w-10/12 max-w-sm border-b border-slate-300 p-1 text-center focus:outline-none"
            />
            <label className="mt-3 text-xs">カテゴリ</label>
            <select
              className="mx-auto w-5/12 max-w-sm border-b border-slate-300 p-1 text-center focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                選択
              </option>
              <option value="麺類">麺類</option>
              <option value="汁">汁</option>
              <option value="鍋">鍋</option>
              <option value="米類">米類</option>
              <option value="野菜類">野菜類</option>
              <option value="肉類">肉類</option>
            </select>
            <div className="mx-2 mt-5 flex max-w-sm items-center justify-between gap-3 pb-1 text-xs sm:mx-auto">
              <label className="mx-7 text-xs">食材・量</label>
              <div className="mx-7 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleAddInputs}
                  className="flex items-center "
                >
                  項目増やす{" "}
                  <PlusCircleIcon className="h-5 w-5 text-green-500" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveInputs}
                  className="flex items-center "
                >
                  減らす <MinusCircleIcon className="h-5 w-5 text-pink-400" />
                </button>
              </div>
            </div>
            <div className="mx-auto w-10/12 max-w-sm rounded-lg px-2 py-5 ring-1 ring-slate-300">
              <div className="mx-auto mb-2 grid grid-cols-7">
                <label className="col-span-1 text-xs">No</label>
                <label className="col-span-4 text-xs">食材・調味料など</label>
                <label className="col-span-2 text-xs">数量</label>
              </div>
              {menuIngredient.map((data, index) => (
                <div key={index} className="mx-auto my-1 grid grid-cols-7">
                  <p className="text-center text-xs ">{`${index + 1}`}</p>
                  {/* <input
                    type="text"
                    required
                    placeholder="例：豚肉"
                    value={data.name}
                    onChange={(e) => handleChange(e, index, "name")}
                    className="col-span-4 mx-1 border-b border-slate-300 text-center focus:outline-none"
                  /> */}
                  <select
                    value={data.id}
                    onChange={(e) => handleChange(e, index, "name")}
                    className="col-span-4 mx-1 border-b border-slate-300 text-center text-xs focus:outline-none"
                  >
                    <option value="" disabled>
                      選択して下さい
                    </option>
                    {ingredientList.data?.data.map((item) => (
                      <option key={item.id} value={item.id}>
                        {`${item.name}${
                          item.description ? `(${item.description})` : ""
                        }`}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step={0.001}
                    min={0.001}
                    required
                    placeholder="例：1"
                    value={data.quantity}
                    onChange={(e) =>
                      e.target.value !== null &&
                      handleChange(e, index, "quantity")
                    }
                    className="col-span-1 ml-1 border-b border-slate-300 pr-1 text-end text-xs focus:outline-none"
                  />
                  <p className="col-span-1 mr-1 border-b border-slate-300 text-xs">
                    {ingredientList.data?.data
                      .filter((item) => item.id === data.id)
                      .map((res) => res.unit)}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={disableSubmit}
              className="mx-auto my-8 rounded-full px-2 py-1 text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-10"
            >
              登録
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
