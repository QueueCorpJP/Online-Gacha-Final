"use client"

import { useEffect, useState } from "react"
import { GripVertical, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import { fetchCategories, addCategory, deleteCategory, updateCategoryOrder } from "@/redux/features/categorySlice"
import { DragDropContext, Draggable, type DropResult } from "react-beautiful-dnd"
import { StrictModeDroppable } from "./strict-mode-droppable"

interface Category {
  id: string
  name: string
}

export function CategoryManager() {
  const dispatch = useDispatch<AppDispatch>()
  const { categories, isLoading, error } = useSelector((state: RootState) => state.category)
  const [newCategory, setNewCategory] = useState("")
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      toast.error("カテゴリー名を入力してください")
      return
    }

    try {
      await dispatch(addCategory(newCategory)).unwrap()
      setNewCategory("")
      toast.success("カテゴリーを追加しました")
    } catch (error) {
      toast.error("カテゴリーの追加に失敗しました")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap()
      toast.success("カテゴリーを削除しました")
    } catch (error: any) {
      // Check if the error message contains the foreign key constraint message
      console.log(error)
      if (error.includes('Cannot delete this category because it is still being used by one or more gachas')) {
        toast.error(
          "このカテゴリーは1つ以上のガチャで使用されているため削除できません。先にガチャを別のカテゴリーに再割り当てしてください。",
          {
            duration: 5000, // Show longer for this important message
          }
        )
      } else {
        console.log(error)

        toast.error("カテゴリーの削除に失敗しました")
      }
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setIsReordering(true)
    try {
      await dispatch(updateCategoryOrder({
        categories: items.map((item, index) => ({ id: item.id, order: index }))
      })).unwrap()
      await dispatch(fetchCategories()).unwrap()
      toast.success("カテゴリーの並び替えを保存しました")
    } catch (error) {
      toast.error("カテゴリーの並び替えに失敗しました")
    } finally {
      setIsReordering(false)
    }
  }

  if (isLoading || isReordering) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">カテゴリー管理</h2>
      <form onSubmit={handleAddCategory} className="flex gap-4">
        <Input
          placeholder="新しいカテゴリー名"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" className="bg-black hover:bg-gray-800">
          追加
        </Button>
      </form>
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="categories-drag-and-drop">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {categories.map((category, index) => (
                <Draggable 
                  key={category.id} 
                  draggableId={category.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between rounded-lg border bg-white p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps} className="cursor-move text-gray-400 hover:text-gray-600">
                          <GripVertical className="h-5 w-5" />
                          <span className="sr-only">Move category</span>
                        </div>
                        <span>{category.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Delete category</span>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </div>
  )
}

