import React from "react";

interface AdminLoadingStateProps {
  message?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = "Loading store data...",
}) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-stone-500 font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
};
