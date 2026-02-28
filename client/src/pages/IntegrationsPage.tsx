import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationDialog } from "@/components/IntegrationDialog";
import { useIntegrations } from "@/hooks/use-integrations";
import { 
  SiNotion, 
  SiLinear, 
  SiSlack, 
  SiGithub, 
  SiGoogledrive, 
  SiConfluence, 
  SiPagerduty, 
  SiDatadog,
} from "react-icons/si";
import { CheckCircle2, Blocks, Cpu } from "lucide-react";
import type { IconType } from "react-icons";

// App metadata including specific brand colors
interface AppInfo {
  id: string;
  name: string;
  icon: IconType;
  color: string;
}

const INTEGRATION_APPS: AppInfo[] = [
  { id: 'notion', name: 'Notion', icon: SiNotion, color: '#000000' },
  { id: 'linear', name: 'Linear', icon: SiLinear, color: '#5E6AD2' },
  { id: 'slack', name: 'Slack', icon: SiSlack, color: '#4A154B' },
  { id: 'github', name: 'GitHub', icon: SiGithub, color: '#181717' },
  { id: 'google-drive', name: 'Google Drive', icon: SiGoogledrive, color: '#4285F4' },
  { id: 'confluence', name: 'Confluence', icon: SiConfluence, color: '#172B4D' },
  { id: 'pagerduty', name: 'PagerDuty', icon: SiPagerduty, color: '#06AC38' },
  { id: 'datadog', name: 'Datadog', icon: SiDatadog, color: '#632CA6' },
  { id: 'servicenow', name: 'ServiceNow', icon: Cpu, color: '#293E40' },
];

export default function IntegrationsPage() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const { data: integrations, isLoading } = useIntegrations();

  // Helper to check if an app is already connected
  const isAppConnected = (appId: string) => {
    if (!integrations) return false;
    return integrations.some(integration => integration.provider === appId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Elegant Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Blocks size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Orcho
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="absolute top-16 right-6 hidden lg:block">
          <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl rotate-3">
            <Blocks size={64} />
          </div>
        </div>
        <div className="max-w-2xl mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-foreground">
            What do you want to integrate Orcho with?
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Configure as many or as little from the following tools to allow Orcho remediate your context
          </p>
        </div>

        {isLoading ? (
          // Loading Skeleton Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-28 h-6 rounded-md" />
                </div>
                <Skeleton className="w-24 h-10 rounded-md" />
              </Card>
            ))}
          </div>
        ) : (
          // Integrations Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEGRATION_APPS.map((app) => {
              const Icon = app.icon;
              const integration = integrations?.find(i => i.provider === app.id);
              const connected = !!integration;

              return (
                <Card 
                  key={app.id} 
                  className="p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 border-border/60 hover:border-border group bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        backgroundColor: `${app.color}15`, // 15% opacity background
                        color: app.color 
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{app.name}</h3>
                      {connected && (
                        <div className="flex items-center text-xs font-medium text-emerald-600 mt-0.5 gap-1">
                          <CheckCircle2 size={12} />
                          <span>Connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant={connected ? "secondary" : "default"}
                    className={connected 
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-none font-medium" 
                      : "shadow-sm shadow-primary/10 hover:-translate-y-0.5 transition-transform font-semibold"
                    }
                    onClick={() => setSelectedApp(app)}
                  >
                    {connected ? "Update Status" : "Connect"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Integration Connection Dialog */}
      <IntegrationDialog 
        isOpen={!!selectedApp} 
        onClose={() => setSelectedApp(null)} 
        app={selectedApp}
        existingKey={integrations?.find(i => i.provider === selectedApp?.id)?.apiKey}
      />
    </div>
  );
}
