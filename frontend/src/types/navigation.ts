export interface NavItem {
  id: string
  label: string
  icon: string
  to?: string
  children?: NavSubItem[]
  badge?: string | number
}

export interface NavSubItem {
  id: string
  label: string
  to: string
  badge?: string | number
}

export interface QuickCreateItem {
  id: string
  label: string
  icon: string
  description?: string
  to?: string
  action?: () => void
}
