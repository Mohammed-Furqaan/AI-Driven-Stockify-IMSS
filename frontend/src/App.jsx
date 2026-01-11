import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import Root from "./utils/Root";
import Login from "./pages/login";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Dashboard from "./pages/Dashboard";
import Categories from "./components/Categories";
import Suppliers from "./components/Suppliers";
import Products from "./components/Products";
import Logout from "./components/Logout";
import User from "./components/User";
import CustomerProducts from "./components/CustomerProducts";
import Orders from "./components/Orders";
import Profile from "./components/Profile";
import Summary from "./components/Summary";
import StockBot from "./components/StockBot";
import DemandPrediction from "./components/DemandPrediction";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoutes requiredRole={["admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Summary />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<User />} />
          <Route path="chatbot" element={<StockBot />}></Route>
          <Route
            path="demand-prediction"
            element={<DemandPrediction />}
          ></Route>

          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<Logout />} />
        </Route>
        <Route path="/customer-dashboard" element={<Dashboard />}>
          <Route index element={<CustomerProducts />}></Route>
          <Route path="orders" element={<Orders />}></Route>
          <Route path="logout" element={<Logout />}></Route>
          <Route path="profile" element={<Profile />}></Route>
          <Route path="chatbot" element={<StockBot />}></Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route
          path="/unauthorized"
          element={
            <p className="font-bold text-3xl mt-20 ml-20">Unauthorized</p>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
