import React from "react";

interface AuthLoadingGateProps {
  isLoading: boolean;
  statusText?: string;
}

export const AuthLoadingGate: React.FC<AuthLoadingGateProps> = ({
  isLoading,
  statusText = "Securing session context...",
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white select-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm text-center px-6">
        
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse-ring" />
          <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse-ring [animation-delay:1.25s]" />
          
          <img
            src="/3dicons-lock-dynamic-color.png" // Path matching your project tab file
            alt="lock-dynamic"
            className="w-24 h-24 object-contain relative z-10 animate-lock-float"
          />
        </div>

        <h3 className="text-xl font-bold tracking-tight mb-2 bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
          {statusText}
        </h3>
        
        <div className="flex items-center gap-1.5 justify-center mt-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]" />
        </div>
        
        <p className="text-xs text-gray-500 mt-6 tracking-wide uppercase font-medium">
          RecruitBot Gateway v1.0
        </p>
      </div>
    </div>
  );
};