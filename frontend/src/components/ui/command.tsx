import * as React from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function Command({ className, children, ...props }: CommandProps) {
  return (
    <div
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CommandInputProps extends React.ComponentProps<"input"> {
  onValueChange?: (value: string) => void
}

function CommandInput({
  className,
  onValueChange,
  ...props
}: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center border-b px-3"
    >
      <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-list"
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CommandEmpty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) {
  return (
    <div
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[data-slot=command-group-heading]]:px-2 [&_[data-slot=command-group-heading]]:py-1.5 [&_[data-slot=command-group-heading]]:text-xs [&_[data-slot=command-group-heading]]:font-medium [&_[data-slot=command-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {heading && <div data-slot="command-group-heading">{heading}</div>}
      {children}
    </div>
  )
}

function CommandSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  onSelect?: () => void
}

function CommandItem({
  className,
  disabled,
  onSelect,
  ...props
}: CommandItemProps) {
  return (
    <div
      data-slot="command-item"
      data-disabled={disabled}
      onClick={() => !disabled && onSelect?.()}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
