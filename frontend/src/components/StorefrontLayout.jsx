import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const StorefrontLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1F2421]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StorefrontLayout;
