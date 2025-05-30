// import { PeerListIcons } from "@/assets/PeerListIcons";
// import { cn } from "@/components/utils/helpers";
import { PeerListIcons } from "@/utils/PeerListIcons";
import { cn } from "@/utils/helpers";
import clsx from "clsx";
import React from "react";

type StripProps = {
  type: string;
  title: string;
  className?: string;
  variant: "normal" | "danger";
  onClick?: () => void;
  disabled?: boolean;
};

const Strip: React.FC<StripProps> = ({ type, title, variant, onClick, disabled=false }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-sm font-normal mb-1 last:mb-0 transition-all duration-300 ease-in-out p-1 rounded-md",
        variant === "normal"
          ? "text-gray-700"
          : " text-red-400 hover:bg-rgbColors-4 ",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none" 
      )}
      onClick={disabled ? undefined : onClick} 
    >
      <div className="flex w-6 h-6 justify-center items-center">
        {PeerListIcons[type]}
      </div>
      <div>{title}</div>
    </div>
  );
};
export default React.memo(Strip);
