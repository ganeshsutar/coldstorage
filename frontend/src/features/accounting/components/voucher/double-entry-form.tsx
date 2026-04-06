import { PlusIcon, TrashIcon, CheckIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import type { Account } from "../../types/account"
import type { VoucherLine } from "../../types/voucher"
import { formatIndianNumber } from "../../utils/format-currency"
import { AccountCombobox } from "./account-combobox"

interface DoubleEntryFormProps {
  accounts: Account[]
  lines: VoucherLine[]
  onChange: (lines: VoucherLine[]) => void
}

export function DoubleEntryForm({
  accounts,
  lines,
  onChange,
}: DoubleEntryFormProps) {
  const addLine = () => {
    onChange([
      ...lines,
      { account_id: "", debit: null, credit: null },
    ])
  }

  const updateLine = (index: number, updates: Partial<VoucherLine>) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], ...updates }
    onChange(newLines)
  }

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    onChange(lines.filter((_, i) => i !== index))
  }

  const handleDebitChange = (index: number, value: string) => {
    const numValue = value ? parseFloat(value) : null
    updateLine(index, {
      debit: numValue,
      credit: numValue ? null : lines[index].credit,
    })
  }

  const handleCreditChange = (index: number, value: string) => {
    const numValue = value ? parseFloat(value) : null
    updateLine(index, {
      credit: numValue,
      debit: numValue ? null : lines[index].debit,
    })
  }

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div data-slot="double-entry-form" data-testid="double-entry-form" className="space-y-4">
      <Table data-testid="double-entry-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Account</TableHead>
            <TableHead className="text-right w-[25%]">Debit</TableHead>
            <TableHead className="text-right w-[25%]">Credit</TableHead>
            <TableHead className="w-[10%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow key={index}>
              <TableCell>
                <AccountCombobox
                  accounts={accounts}
                  value={line.account_id || null}
                  onChange={(id) => updateLine(index, { account_id: id || "" })}
                  placeholder="Select account..."
                  data-testid={`voucher-line-account-${index}`}
                />
              </TableCell>
              <TableCell>
                <Input
                  data-testid={`voucher-line-debit-${index}`}
                  type="number"
                  value={line.debit || ""}
                  onChange={(e) => handleDebitChange(index, e.target.value)}
                  placeholder="0"
                  className="text-right font-mono"
                  disabled={!!line.credit}
                />
              </TableCell>
              <TableCell>
                <Input
                  data-testid={`voucher-line-credit-${index}`}
                  type="number"
                  value={line.credit || ""}
                  onChange={(e) => handleCreditChange(index, e.target.value)}
                  placeholder="0"
                  className="text-right font-mono"
                  disabled={!!line.debit}
                />
              </TableCell>
              <TableCell>
                <Button
                  data-testid={`voucher-line-delete-${index}`}
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeLine(index)}
                  disabled={lines.length <= 2}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-medium">Total</TableCell>
            <TableCell data-testid="voucher-total-debit" className="text-right font-mono font-medium text-status-danger-foreground">
              {formatIndianNumber(totalDebit)}
            </TableCell>
            <TableCell data-testid="voucher-total-credit" className="text-right font-mono font-medium text-status-success-foreground">
              {formatIndianNumber(totalCredit)}
            </TableCell>
            <TableCell>
              <span data-testid="voucher-balance-indicator">
              {isBalanced ? (
                <CheckIcon className="size-4 text-status-success-foreground" />
              ) : (
                <XIcon className="size-4 text-status-danger-foreground" />
              )}
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="flex items-center justify-between">
        <Button data-testid="voucher-add-line-button" variant="outline" size="sm" onClick={addLine}>
          <PlusIcon className="mr-2 size-4" />
          Add Line
        </Button>

        {!isBalanced && (
          <p data-testid="voucher-difference-text" className="text-sm text-destructive">
            Difference: {formatIndianNumber(Math.abs(totalDebit - totalCredit))}
          </p>
        )}
      </div>
    </div>
  )
}
