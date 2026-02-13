import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import SideMenu from './SideMenu';

export default function MainLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Search state could be lifted here or manageable via URL params in a real app.
    // For now, we'll keep the Header search visual or pass dummy props if needed,
    // but typically the layout handles the chrome.
    // If Header needs to filter the page content, we might need context or URL params.
    // For this refactor, let's just render it.

    return (
        <div className="flex flex-col h-full bg-[#FDFBF4] min-h-screen pb-20">
            <div className="sticky top-0 z-50 w-full">
                <Header
                    onMenuClick={() => setIsMenuOpen(true)}
                // Search props would go here if we lifted state, 
                // or Header manages URL params.
                />
            </div>

            <div className="flex-1">
                <Outlet />
            </div>

            <BottomNav />
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
}
