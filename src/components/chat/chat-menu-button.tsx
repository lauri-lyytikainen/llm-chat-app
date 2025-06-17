'use client'

import { EllipsisIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { useRef, useState, useEffect } from 'react'
import { SidebarMenuButton } from '../ui/sidebar'

interface ChatMenuButtonProps {
  chatId: string
  title: string
  isActive: boolean
  onSelect: () => void
  onRename: (chatId: string, newTitle: string) => Promise<void>
  onDelete: (chatId: string) => void
}

export function ChatMenuButton({ chatId, title, isActive, onSelect, onRename, onDelete }: ChatMenuButtonProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setNewTitle(title)
  }

  const handleSaveRename = async () => {
    if (newTitle.trim()) {
      await onRename(chatId, newTitle)
    }
    setIsEditing(false)
    setNewTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setNewTitle('')
    }
  }

  return (
    <SidebarMenuButton
      onClick={onSelect}
      className={`${isActive ? 'bg-accent' : ''} relative flex justify-between items-center`}
    >
      {isEditing ? (
        <Input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveRename}
          className="h-6 text-sm"
        />
      ) : (
        title
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={handleRename}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => onDelete(chatId)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuButton>
  )
}
