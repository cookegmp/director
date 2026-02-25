import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUsersStore } from '@/stores/users';
import type { User } from '@/types';

interface UserRemoveDialogProps {
  user: User | null;
  onClose: () => void;
}

function UserRemoveDialog({ user, onClose }: UserRemoveDialogProps) {
  const removeUser = useUsersStore((s) => s.removeUser);

  const handleRemove = () => {
    if (user) {
      removeUser(user.id);
      onClose();
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-light">Remove User</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Remove <strong className="text-foreground">{user?.name}</strong>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserRemoveDialog;
