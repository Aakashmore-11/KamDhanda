import React from "react";
import Nav from "../components/header/Nav";
import Footer from "../components/footer/Footer";
import AIChatbot from "../components/common/AIChatbot";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <div className="w-full flex flex-col min-h-screen relative">
        <Nav />
        <main className="flex-1 w-full px-4 md:px-8 lg:px-12 xl:px-16 py-6">
          <Outlet />
        </main>
        <AIChatbot />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
