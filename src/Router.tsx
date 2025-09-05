import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login/Login";
import Board from "@/pages/Dashboard/Dashboard";


function ProtectedRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("userId"));
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}