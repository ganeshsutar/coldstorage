import * as React from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccountTreeNode as AccountTreeNodeType } from "../../types/account"
import { AccountTreeNode } from "./account-tree-node"

interface AccountTreeProps {
  tree: AccountTreeNodeType[]
  loading?: boolean
  onSelect?: (node: AccountTreeNodeType) => void
}

function filterTreeNodes(
  nodes: AccountTreeNodeType[],
  query: string
): AccountTreeNodeType[] {
  if (!query) return nodes

  const lowerQuery = query.toLowerCase()

  return nodes
    .map((node) => {
      const matchesName = node.name.toLowerCase().includes(lowerQuery)
      const matchesCode = node.code.toLowerCase().includes(lowerQuery)
      const filteredChildren = filterTreeNodes(node.children || [], query)

      if (matchesName || matchesCode || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }
      return null
    })
    .filter((node): node is AccountTreeNodeType => node !== null)
}

export function AccountTree({ tree, loading, onSelect }: AccountTreeProps) {
  const [search, setSearch] = React.useState("")

  const filteredTree = React.useMemo(
    () => filterTreeNodes(tree, search),
    [tree, search]
  )

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div data-slot="account-tree" data-testid="account-tree" className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            data-testid="account-tree-search-input"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTree.length === 0 ? (
            <div data-testid="account-tree-empty" className="text-center text-sm text-muted-foreground py-8">
              No accounts found
            </div>
          ) : (
            filteredTree.map((node) => (
              <AccountTreeNode
                key={node.id}
                node={node}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
