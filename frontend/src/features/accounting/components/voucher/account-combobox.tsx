import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Account } from "../../types/account"

interface AccountComboboxProps {
  accounts: Account[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "data-testid"?: string
}

export function AccountCombobox({
  accounts,
  value,
  onChange,
  placeholder = "Select account...",
  disabled,
  className,
  "data-testid": testId,
}: AccountComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedAccount = accounts.find((a) => a.id === value)

  const filteredAccounts = React.useMemo(() => {
    if (!search) return accounts
    const lowerSearch = search.toLowerCase()
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerSearch) ||
        a.code.toLowerCase().includes(lowerSearch)
    )
  }, [accounts, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          data-testid={testId}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedAccount
            ? `${selectedAccount.code} - ${selectedAccount.name}`
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            data-testid="account-combobox-search"
            placeholder="Search accounts..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty data-testid="account-combobox-empty">No account found.</CommandEmpty>
            <CommandGroup>
              {filteredAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  onSelect={() => {
                    onChange(account.id === value ? null : account.id)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === account.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-mono text-sm mr-2">{account.code}</span>
                  <span className="truncate">{account.name}</span>
                  {account.party_type && (
                    <span className="ml-auto text-xs text-blue-600">Party</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
