import { LandingPage } from "./LandingPage/LandingPage";
import { SocketsProvider } from "./shared/contexts/sockets.context";

function App() {
  return (
    <SocketsProvider>
      <main>
        <section>
          <LandingPage />
        </section>
      </main>
    </SocketsProvider>
  );
}

export default App;
