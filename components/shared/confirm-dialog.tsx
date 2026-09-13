"use client";

import { AlertCircle, Trash2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isPending?: boolean;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  icon?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending = false,
  variant = "destructive",
  icon,
}: ConfirmDialogProps) {
  const variantConfig = {
    destructive: {
      icon: <Trash2 className="h-6 w-6" />,
      iconBg: "bg-primary/15 text-primary",
      button: "bg-primary text-white hover:bg-primary/80",
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6" />,
      iconBg: "bg-primary/15 text-primary",
      button: "bg-primary text-white hover:bg-primary/80",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconBg: "bg-primary/15 text-primary",
      button: "bg-primary text-white hover:bg-primary/80",
    },
    info: {
      icon: <Info className="h-6 w-6" />,
      iconBg: "bg-primary/15 text-primary",
      button: "bg-primary text-white hover:bg-primary/80",
    },
    default: {
      icon: <AlertCircle className="h-6 w-6" />,
      iconBg: "bg-white/8 text-white/70",
      button: "bg-primary text-white hover:bg-primary/80",
    },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const displayIcon = icon ?? config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm rounded-xl">
        <DialogHeader className="items-center text-center">
          {displayIcon !== null && (
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
              {displayIcon}
            </div>
          )}
          <DialogTitle className="font-chillax text-base font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="font-chillax text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-2 gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 rounded-md"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 rounded-md ${config.button}`}
            disabled={isPending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
