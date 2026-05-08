"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmationModalProps {
  /** Dialog trigger element. */
  trigger: React.ReactNode;
  /** Modal title. */
  title: string;
  /** Description / warning message. */
  description: string;
  /** Label for the confirm button. Default: "Hapus" */
  confirmLabel?: string;
  /** Confirm button variant. Default: "destructive" */
  confirmVariant?: "destructive" | "default";
  /** Called when user confirms. Return a promise to show loading state. */
  onConfirm: () => void | Promise<void>;
}

/**
 * Reusable confirmation modal for destructive or important actions.
 * Shows a loading spinner during async confirm callbacks.
 */
export function ConfirmationModal({
  trigger,
  title,
  description,
  confirmLabel = "Hapus",
  confirmVariant = "destructive",
  onConfirm,
}: ConfirmationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Error handling is the caller's responsibility
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
