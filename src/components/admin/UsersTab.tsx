import { useState } from 'react'
import { Plus, MoreHorizontal, Shield, Code2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUsersStore } from '@/stores/users'
import type { User, UserRole } from '@/types'
import UserAddDialog from './UserAddDialog'
import UserRemoveDialog from './UserRemoveDialog'

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function UsersTab() {
  const users = useUsersStore((s) => s.users)
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const changeRole = useUsersStore((s) => s.changeRole)
  const setStatus = useUsersStore((s) => s.setStatus)
  const isLastAdmin = useUsersStore((s) => s.isLastAdmin)
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<User | null>(null)

  const handleRoleChange = (userId: string, role: UserRole) => {
    if (isLastAdmin(userId) && role !== 'admin') return
    changeRole(userId, role)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Users & Roles</h2>
          <p className="text-sm text-muted-foreground">
            Manage who has access to Control and what they can do.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Email
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Last Active
              </th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isCurrent = user.id === currentUserId
              const isOnlyAdmin = isLastAdmin(user.id)

              return (
                <tr
                  key={user.id}
                  className={`transition-colors hover:bg-accent/30 ${isCurrent ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    <span className="flex items-center gap-2">
                      {user.name}
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-primary/40 text-primary"
                        >
                          You
                        </Badge>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                      disabled={isOnlyAdmin}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-[140px] h-8 bg-transparent border-border text-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </TooltipTrigger>
                        {isOnlyAdmin && (
                          <TooltipContent>Cannot change role of the last admin</TooltipContent>
                        )}
                      </Tooltip>
                      <SelectContent>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        </SelectItem>
                        <SelectItem value="developer">
                          <span className="flex items-center gap-2">
                            <Code2 className="w-3 h-3" /> Developer
                          </span>
                        </SelectItem>
                        <SelectItem value="viewer">
                          <span className="flex items-center gap-2">
                            <Eye className="w-3 h-3" /> Viewer
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'
                        }`}
                      />
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatRelativeTime(user.lastActive)}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => setStatus(user.id, 'inactive')}>
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setStatus(user.id, 'active')}>
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={isOnlyAdmin || isCurrent}
                          onClick={() => setRemoveTarget(user)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <UserAddDialog open={addOpen} onOpenChange={setAddOpen} />
      <UserRemoveDialog user={removeTarget} onClose={() => setRemoveTarget(null)} />
    </div>
  )
}

export default UsersTab
