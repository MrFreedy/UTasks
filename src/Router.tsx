import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login/Login";
import Board from "@/pages/Dashboard/Dashboard";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}