import { GenesysPanel } from './panel/GenesysPanel';
import { useGenesysSimulator } from './simulator/useGenesysSimulator';
import { VesselDemo } from './vessel/VesselDemo';

export default function App() {
  const simulator = useGenesysSimulator();

  return (
    <main className="demo-page">
      <div className="demo-shell">
        <section className="experiment-panel">
          <VesselDemo simulator={simulator} />
        </section>

        <section className="genesys-panel">
          <GenesysPanel simulator={simulator} />
        </section>
      </div>
    </main>
  );
}
