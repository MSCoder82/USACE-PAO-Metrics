import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import Protected from "./routes/Protected";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Protected />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/metrics" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
