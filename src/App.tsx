import {
  useEffect,
  useState,
} from 'react';

import { GenesysPanel } from './panel/GenesysPanel';
import { useGenesysSimulator } from './simulator/useGenesysSimulator';
import { VesselDemo } from './vessel/VesselDemo';

const DEMO_VIEWPORT_QUERY =
  '(min-width: 1024px) and (min-height: 600px), ' +
  '(min-width: 768px) and (min-height: 600px) and (orientation: landscape)';

function useDemoViewport() {
  const [canRunDemo, setCanRunDemo] =
    useState(() =>
      window
        .matchMedia(DEMO_VIEWPORT_QUERY)
        .matches,
    );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        DEMO_VIEWPORT_QUERY,
      );

    const update = () =>
      setCanRunDemo(
        mediaQuery.matches,
      );

    update();

    mediaQuery.addEventListener(
      'change',
      update,
    );

    return () =>
      mediaQuery.removeEventListener(
        'change',
        update,
      );
  }, []);

  return canRunDemo;
}

function DemoUnavailable() {
  return (
    <main className="demo-device-gate">
      <section className="demo-device-gate-card">
        <span className="device-gate-eyebrow">
          GENESYS V1 — INTERACTIVE DEMO
        </span>

        <h1>
          Designed for a larger screen.
        </h1>

        <p>
          Esta experiencia reproduce la
          interfaz completa del Genesys V1
          y está diseñada para utilizarse
          en ordenador o tablet en
          horizontal.
        </p>

        <div className="device-gate-hint">
          <span className="device-gate-icon">
            ↻
          </span>

          <span>
            Abre esta página desde un
            ordenador o gira tu tablet.
          </span>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const canRunDemo =
    useDemoViewport();

  const simulator =
    useGenesysSimulator();

  if (!canRunDemo) {
    return <DemoUnavailable />;
  }

  return (
    <main className="demo-page">
      <div className="demo-shell">
        <section className="experiment-panel">
          <VesselDemo
            simulator={simulator}
          />
        </section>

        <section className="genesys-panel">
          <GenesysPanel
            simulator={simulator}
          />
        </section>
      </div>
    </main>
  );
}
