import * as React from "react"
import { ChevronRightIcon, FolderIcon, UserIcon, FileTextIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AccountTreeNode as AccountTreeNodeType } from "../../types/account"
import { formatBalance } from "../../utils/format-currency"

interface AccountTreeNodeProps {
  node: AccountTreeNodeType
  level?: number
  onSelect?: (node: AccountTreeNodeType) => void
}

export function AccountTreeNode({
  node,
  level = 0,
  onSelect,
}: AccountTreeNodeProps) {
  const [expanded, setExpanded] = React.useState(level < 2)
  const hasChildren = node.children && node.children.length > 0

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    }
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(node)
  }

  const getIcon = () => {
    if (node.is_party) {
      return <UserIcon className="h-4 w-4 text-blue-500" />
    }
    if (node.is_group) {
      return <FolderIcon className="h-4 w-4 text-amber-500" />
    }
    return <FileTextIcon className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div data-slot="account-tree-node">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer group",
          "transition-colors"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleToggle}
      >
        <button
          type="button"
          className={cn(
            "h-4 w-4 flex items-center justify-center shrink-0",
            !hasChildren && "invisible"
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
        >
          <ChevronRightIcon
            className={cn(
              "h-3 w-3 transition-transform text-muted-foreground",
              expanded && "rotate-90"
            )}
          />
        </button>

        {getIcon()}

        <span
          className={cn(
            "flex-1 text-sm truncate",
            node.is_group && "font-medium"
          )}
          onClick={handleSelect}
        >
          {node.name}
        </span>

        {node.balance !== 0 && (
          <span
            className={cn(
              "text-sm font-mono tabular-nums shrink-0",
              node.balance_type === "Dr" ? "text-red-600" : "text-green-600"
            )}
          >
            {formatBalance(node.balance, node.balance_type)}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div data-slot="account-tree-children">
          {node.children.map((child) => (
            <AccountTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
