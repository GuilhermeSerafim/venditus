import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const AppLayout = ({ children, title, description, actions }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background dark:bg-gradient-radial-dark bg-gradient-radial-light">
      <AppSidebar />
      
      <div className="md:pl-[68px] min-h-screen transition-all duration-300">
        <TopBar />
        
        <main className="px-4 py-4 md:px-6 md:py-6 animate-fade-in">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 md:gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};