import { Outlet } from "react-router-dom";
const ClientLayout = () => {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
};

export default ClientLayout;
