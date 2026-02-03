import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Palette,
  Sun,
  Monitor,
  Circle,
  Check,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getInitials, generateAvatarFromEmail } from "@/lib/avatar"
import {
  useTheme,
  type ThemeMode,
  type NeutralColor,
  type AccentColor,
  type RadiusSize,
  type StylePreset,
} from "@/hooks/use-theme"

interface SidebarUserProps {
  email: string
  name?: string
  onSignOut?: () => void
}

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

const styleOptions: { value: StylePreset; label: string; description: string }[] = [
  { value: "vega", label: "Vega", description: "Classic" },
  { value: "nova", label: "Nova", description: "Compact" },
  { value: "maia", label: "Maia", description: "Rounded" },
  { value: "lyra", label: "Lyra", description: "Sharp" },
  { value: "mira", label: "Mira", description: "Dense" },
]

const neutralOptions: { value: NeutralColor; label: string }[] = [
  { value: "gray", label: "Gray" },
  { value: "zinc", label: "Zinc" },
  { value: "neutral", label: "Neutral" },
  { value: "stone", label: "Stone" },
  { value: "slate", label: "Slate" },
]

const accentOptions: { value: AccentColor; label: string; color: string }[] = [
  { value: "zinc", label: "Zinc", color: "bg-zinc-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "amber", label: "Amber", color: "bg-amber-500" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "lime", label: "Lime", color: "bg-lime-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { value: "teal", label: "Teal", color: "bg-teal-500" },
  { value: "cyan", label: "Cyan", color: "bg-cyan-500" },
  { value: "sky", label: "Sky", color: "bg-sky-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
  { value: "fuchsia", label: "Fuchsia", color: "bg-fuchsia-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
]

const radiusOptions: { value: RadiusSize; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "full", label: "Full" },
]

export function SidebarUser({ email, name, onSignOut }: SidebarUserProps) {
  const { isMobile } = useSidebar()
  const { config, setMode, setStyle, setNeutral, setAccent, setRadius } = useTheme()

  const displayName = name || email.split("@")[0]
  const avatarUrl = generateAvatarFromEmail(email, name)
  const initials = getInitials(displayName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Style Preset Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 size-4" />
                Style
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {styleOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStyle(option.value)}
                  >
                    <span className="flex-1">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                    {config.style === option.value && (
                      <Check className="ml-2 size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Theme Mode Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {config.mode === "light" && <Sun className="mr-2 size-4" />}
                {config.mode === "dark" && <Moon className="mr-2 size-4" />}
                {config.mode === "system" && <Monitor className="mr-2 size-4" />}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {themeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setMode(option.value)}
                  >
                    <option.icon className="mr-2 size-4" />
                    {option.label}
                    {config.mode === option.value && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Neutral Color Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Circle className="mr-2 size-4" />
                Neutral
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {neutralOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setNeutral(option.value)}
                  >
                    {option.label}
                    {config.neutral === option.value && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Accent Color Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="mr-2 size-4 rounded-full bg-primary" />
                Accent
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                {accentOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setAccent(option.value)}
                  >
                    <div className={`mr-2 size-4 rounded-full ${option.color}`} />
                    {option.label}
                    {config.accent === option.value && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Radius Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="mr-2 size-4 rounded border-2 border-current" />
                Radius
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {radiusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setRadius(option.value)}
                  >
                    {option.label}
                    {config.radius === option.value && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
