import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function BottomNav() {
    const { cart } = useCart();
    const cartCount = cart.reduce((a, b) => a + b.qty, 0);

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `transition-colors ${isActive ? "text-[#961E20]" : "hover:text-[#961E20]/50"}`;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBF4]/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 flex justify-around items-center text-gray-400 z-40 max-w-md lg:hidden mx-auto">
            <NavLink to="/shop" className={navClass} end>
                {({ isActive }) => <Home className={isActive ? "fill-current" : ""} />}
            </NavLink>

            <NavLink to="/favorites" className={navClass}>
                {({ isActive }) => <Heart className={isActive ? "fill-current" : ""} />}
            </NavLink>

            <NavLink to="/cart" className={`relative ${navClass({ isActive: location.pathname === '/cart' })}`}>
                {({ isActive }) => (
                    <>
                        <ShoppingBag className={isActive ? "fill-current" : ""} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#961E20] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-small">
                                {cartCount}
                            </span>
                        )}
                    </>
                )}
            </NavLink>

            <NavLink to="/profile" className={navClass}>
                {({ isActive }) => <User className={isActive ? "fill-current" : ""} />}
            </NavLink>
        </div>
    );
}
