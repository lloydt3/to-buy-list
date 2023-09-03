
export interface IIngredients {
    id?: string
    name: string
    description: string
    category: string
    unit: string
    createdByUserId?: string
    frequency?: number
    notes?: string | null
    createdAt?: Date
    updatedAt?: Date
}

export interface IEditIngredients {
    id: string
    name: string
    description: string
    category: string
    unit: string
    createdByUserId: string
    frequency: number
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

export interface IMenu {
    id: string
    name: string
    description: string
    category: string
    createdByUserId?: string
    frequency?: number
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface IPlannedMenu {
    id: string
    name: string
    description: string
    category: string
    day?: Date
}

export interface IMenuIngredient {
    id: string
    name?: string
    description?: string
    quantity: number
    unit: string
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}