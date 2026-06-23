import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ThemeProvider } from './context/ThemeContext.tsx'
import './index.css'
import App from './App.tsx'
import { setTokenGetter } from './api/axios.ts'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable key");
}

export const AppWithAuth = () => {
  const { getToken, isLoaded } = useAuth();

  if (isLoaded) {
    setTokenGetter(async () => {
      try {
        const token = await getToken();
        console.log("Token fetched:", token ? "✅ exists" : "❌null");
        return token;
      } catch (err) {
        console.error("Token fetch error:", err);
        return null;
      }
    });
  }

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <ThemeProvider>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}
      signUpUrl="/register"
      signInUrl="/login"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
    >
    <AppWithAuth />
    </ClerkProvider>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
