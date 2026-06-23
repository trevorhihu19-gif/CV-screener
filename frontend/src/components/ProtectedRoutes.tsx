import { useUser, RedirectToSignIn } from "@clerk/clerk-react";

const ProtectedRoute = ({ children}: {children: React.ReactNode}) => {
  const { isLoaded, isSignedIn} = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }
  return <>{children}</>
}

export default ProtectedRoute;