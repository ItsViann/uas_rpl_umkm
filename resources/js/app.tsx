import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        let storeName = (router as any).page?.props?.store?.store_name;

        console.log("ROUTER STATE:", (router as any).page);
        console.log("ROUTER PAGE PROPS:", (router as any).page?.props);

        if (!storeName && typeof document !== 'undefined') {
            const appEl = document.getElementById('app');

            if (appEl && appEl.dataset.page) {
                try {
                    const pageData = JSON.parse(appEl.dataset.page);
                    storeName = pageData.props?.store?.store_name;
                    console.log("PARSED STORE NAME:", storeName);
                } catch {
                    // Ignore parsing errors
                }
            }
        }

        const finalStoreName = storeName || appName;

        return title ? `${title} - ${finalStoreName}` : finalStoreName;
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
