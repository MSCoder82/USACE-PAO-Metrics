import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import Protected from "./routes/Protected";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

const basename = (() => {
  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const normalised = baseUrl.replace(/\/+$/, '');
  return normalised === '' ? undefined : normalised;
})();

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          <Route element={<Protected />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/metrics" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
