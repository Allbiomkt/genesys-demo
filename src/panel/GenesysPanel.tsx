import {
    useEffect,
    useRef,
    useState,
  } from 'react';
  
  import type { DemoTab } from '../simulator/simulatorTypes';
  import type { useGenesysSimulator } from '../simulator/useGenesysSimulator';
  
  import { MainTab } from './tabs/MainTab';
  import { GraphTab } from './tabs/GraphTab';
  import { HistoryTab } from './tabs/HistoryTab';
  import { NotificationsTab } from './tabs/NotificationsTab';
  import { ProgrammingTab } from './tabs/ProgrammingTab';
  import { SettingsTab } from './tabs/SettingsTab';
  
  import './panel.css';
  
  const LOGICAL_WIDTH = 1024;
  const LOGICAL_HEIGHT = 768;
  
  type Simulator =
    ReturnType<typeof useGenesysSimulator>;
  
  type Props = {
    simulator: Simulator;
  };
  
  const tabs: Array<{
    id: DemoTab;
    label: string;
    icon: string;
  }> = [
    {
      id: 'main',
      label: 'Main',
      icon: '/icons/house-solid.svg',
    },
    {
      id: 'graph',
      label: 'Graph',
      icon: '/icons/chart-line-solid.svg',
    },
    {
      id: 'history',
      label: 'History',
      icon: '/icons/floppy-disk-solid.svg',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '/icons/bell-solid.svg',
    },
    {
      id: 'programming',
      label: 'Programming',
      icon: '/icons/program_page_menu_icon_b.svg',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '/icons/gear-solid.svg',
    },
  ];
  
  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(
      (seconds % 3600) / 60,
    );
    const s = seconds % 60;
  
    return [h, m, s]
      .map((value) =>
        String(value).padStart(2, '0'),
      )
      .join(':');
  }
  
  export function GenesysPanel({
    simulator,
  }: Props) {
    const [activeTab, setActiveTab] =
      useState<DemoTab>('main');
  
    const hostRef =
      useRef<HTMLDivElement | null>(null);
  
    const [scale, setScale] = useState(1);
  
    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
  
      const recalculate = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
  
        const nextScale = Math.min(
          width / LOGICAL_WIDTH,
          height / LOGICAL_HEIGHT,
        );
  
        setScale(
          Math.max(0.1, nextScale),
        );
      };
  
      recalculate();
  
      const observer =
        new ResizeObserver(recalculate);
  
      observer.observe(host);
  
      return () => observer.disconnect();
    }, []);
  
    const now = new Date();
  
    return (
      <div
        ref={hostRef}
        className="genesys-screen-shell"
      >
        <div
          className="genesys-touchscreen-frame"
          style={{
            width:
              LOGICAL_WIDTH * scale + 32,
            height:
              LOGICAL_HEIGHT * scale + 32,
          }}
        >
          <div
            className="genesys-logical-screen"
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <div className="genesys-ui">
              <header className="genesys-header">
                <div className="genesys-brand">
                  <div className="genesys-brand-mark">
                    ALLBIOTECH
                  </div>
  
                  <div className="genesys-device-name">
                    Genesys V1
                  </div>
                </div>
  
                <div className="genesys-timer">
                  <strong>
                    {formatTime(
                      simulator.state
                        .cycleSeconds,
                    )}
                  </strong>
                </div>
  
                <nav className="genesys-nav">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      className={
                        activeTab === tab.id
                          ? 'nav-item active'
                          : 'nav-item'
                      }
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                    >
                      <img
                        src={tab.icon}
                        alt=""
                        draggable={false}
                      />
  
                      <span>{tab.label}</span>
  
                      {tab.id ===
                        'notifications' &&
                        simulator
                          .notifications
                          .length > 0 && (
                          <span className="notification-badge">
                            {
                              simulator
                                .notifications
                                .length
                            }
                          </span>
                        )}
                    </button>
                  ))}
                </nav>
  
                <div className="genesys-date-time">
                  <strong>
                    {now.toLocaleTimeString(
                      'es-ES',
                    )}
                  </strong>
  
                  <span>
                    {now.toLocaleDateString(
                      'es-ES',
                    )}
                  </span>
                </div>
              </header>
  
              <section className="genesys-content">
                {activeTab === 'main' && (
                  <MainTab
                    simulator={simulator}
                  />
                )}
  
                {activeTab === 'graph' && (
                  <GraphTab
                    simulator={simulator}
                  />
                )}
  
                {activeTab === 'history' && (
                  <HistoryTab
                    simulator={simulator}
                  />
                )}
  
                {activeTab ===
                  'notifications' && (
                  <NotificationsTab
                    simulator={simulator}
                  />
                )}
  
                {activeTab ===
                  'programming' && (
                  <ProgrammingTab />
                )}
  
                {activeTab ===
                  'settings' && (
                  <SettingsTab
                    simulator={simulator}
                  />
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
  