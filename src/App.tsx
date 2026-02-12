import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScentsmithsApp from './ScentsmithsApp'
import ScentsmithsAdmin from './ScentsmithsAdmin'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin" element={<ScentsmithsAdmin />} />
                <Route path="/*" element={<ScentsmithsApp />} />
            </Routes>
        </BrowserRouter>
    )
}
