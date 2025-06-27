import { create } from 'zustand';

interface SidebarState {
  open: boolean;
  toggle: () => void;
  setOpen: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: true, // or false if you want closed by default
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (value) => set({ open: value }),
}));