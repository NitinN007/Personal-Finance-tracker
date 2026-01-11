import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Recurring from "./pages/Recurring";
import { useAuth } from "./context/AuthContext";

function Protected({children}){
  const {accessToken}=useAuth();
  if(!accessToken) return <Navigate to="/login" replace />;
  return children;
}

export default function App(){
  return (
    <>
      <Toaster position="top-right"/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          <Route path="/app" element={<Protected><AppLayout/></Protected>}>
            <Route path="dashboard" element={<Dashboard/>} />
            <Route path="transactions" element={<Transactions/>} />
            <Route path="categories" element={<Categories/>} />
            <Route path="budgets" element={<Budgets/>} />
            <Route path="recurring" element={<Recurring/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
