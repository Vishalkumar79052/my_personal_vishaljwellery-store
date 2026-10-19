import { Outlet } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar.jsx";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/orders", label: "My orders" },
  { to: "/dashboard/profile", label: "Profile" },
];

const UserDashboardLayout = () => (
  <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
    <DashboardSidebar title="My Account" links={links} />
    <div className="flex-1">
      <Outlet />
    </div>
  </div>
);

export default UserDashboardLayout;
