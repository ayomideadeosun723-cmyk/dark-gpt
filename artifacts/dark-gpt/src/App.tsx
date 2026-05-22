import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import OwnerPage from "@/pages/OwnerPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 0 },
    mutations: { retry: 0 },
  },
});

function NotFound() {
  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-gothic text-7xl text-blood glow-red animate-flicker mb-4">404</h1>
        <p className="font-crimson text-xl text-ash">This path leads nowhere, mortal.</p>
        <a href="/" className="font-cinzel text-sm text-blood-dark hover:text-blood mt-4 block">← Return to darkness</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/chat" component={ChatPage} />
          <Route path="/owner" component={OwnerPage} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </QueryClientProvider>
  );
}
