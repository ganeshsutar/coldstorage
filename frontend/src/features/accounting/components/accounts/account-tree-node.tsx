import * as React from "react"
import { ChevronRightIcon, FolderIcon, FileTextIcon } from "lucide-react"

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
    if (node.account_type === "GROUP") {
      return <FolderIcon className="size-4 text-amber-500" />
    }
    return <FileTextIcon className="size-4 text-muted-foreground" />
  }

  return (
    <div data-slot="account-tree-node" data-testid={`account-tree-node-${node.id}`}>
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
          data-testid={`account-tree-toggle-${node.id}`}
          aria-label={expanded ? "Collapse account" : "Expand account"}
          className={cn(
            "size-4 flex items-center justify-center shrink-0",
            !hasChildren && "invisible"
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
        >
          <ChevronRightIcon
            className={cn(
              "size-3 transition-transform text-muted-foreground",
              expanded && "rotate-90"
            )}
          />
        </button>

        {getIcon()}

        <span
          data-testid={`account-tree-name-${node.id}`}
          className={cn(
            "flex-1 text-sm truncate",
            node.account_type === "GROUP" && "font-medium"
          )}
          onClick={handleSelect}
        >
          {node.name}
        </span>

        {parseFloat(node.closing_balance) !== 0 && (
          <span
            className={cn(
              "text-sm font-mono tabular-nums shrink-0",
              node.balance_nature === "DEBIT" ? "text-status-danger-foreground" : "text-status-success-foreground"
            )}
          >
            {formatBalance(parseFloat(node.closing_balance), node.balance_nature === "DEBIT" ? "Dr" : "Cr")}
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
