import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./providers/AuthProvider";
import { AuthGate } from "./components/auth/AuthGate";
import Index from "./pages/Index";
import CosmicCompass from "./pages/CosmicCompass";

const queryClient = new QueryClient();

function Main() {
  return (
    <>
      <AuthGate />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planet-quiz" element={<CosmicCompass />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Main />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
