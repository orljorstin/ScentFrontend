import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import ScentsmithsApp from './ScentsmithsApp'
import ScentsmithsAdmin from './ScentsmithsAdmin'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <FavoritesProvider>
                        <Routes>
                            <Route path="/admin" element={<ScentsmithsAdmin />} />
                            <Route path="/*" element={<ScentsmithsApp />} />
                        </Routes>
                    </FavoritesProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
