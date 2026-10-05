import { AutenticacaoProvider } from './contexts/AutenticacaoProvider';
import { AppRouter } from './routers/app.routers';

function App() {
  return (
    <AutenticacaoProvider>
      <AppRouter />
    </AutenticacaoProvider>
  );
}

export default App;
