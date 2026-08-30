import { Cpu, Fan, CircuitBoard, MemoryStick, Gpu, HardDrive, PlugZap, Box, AppWindow, type LucideIcon } from "lucide-react";
import type { PCSlot } from "@/features/pc-builder/types";

export const SLOT_ICONS: Record<PCSlot, LucideIcon> = {
  CPU: Cpu,
  CPU_COOLER: Fan,
  MOTHERBOARD: CircuitBoard,
  RAM: MemoryStick,
  GPU: Gpu,
  STORAGE: HardDrive,
  PSU: PlugZap,
  CASE: Box,
  OS: AppWindow
};
