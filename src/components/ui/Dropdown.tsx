import React from "react";

// Radix ui
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type DropdownProps = {
  align?: "center" | "start" | "end";
  open?: boolean;
  onOpenChange?(open: boolean): void;
  triggerChild: JSX.Element;
  children: React.ReactNode;
  disabled?: boolean; 
};

const Dropdown: React.FC<DropdownProps> = ({
  children,
  triggerChild,
  onOpenChange,
  open,
  align,
  disabled=false, 
}) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <span>{triggerChild}</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        sideOffset={5}
        align={align}
        className="relative bg-white border border-custom-4 rounded-xl p-3 z-10"
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
export default Dropdown;
