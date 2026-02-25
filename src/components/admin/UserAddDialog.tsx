import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsersStore } from '@/stores/users';
import type { UserRole } from '@/types';

interface UserAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserAddDialog({ open, onOpenChange }: UserAddDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [error, setError] = useState('');
  const addUser = useUsersStore((s) => s.addUser);
  const users = useUsersStore((s) => s.users);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setError('A user with this email already exists.');
      return;
    }

    addUser({ name: name.trim(), email: email.trim(), role });
    setName('');
    setEmail('');
    setRole('viewer');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-light">Add User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-2 text-sm transition-colors"
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-2 text-sm transition-colors"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Role</label>
            <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
              <SelectTrigger className="bg-transparent border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserAddDialog;
