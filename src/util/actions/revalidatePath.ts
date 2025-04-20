'use server'
import { revalidatePath as nextRevalidatePath } from "next/cache"

export const revalidatePath = async(path: string) => {
    nextRevalidatePath(path)
}