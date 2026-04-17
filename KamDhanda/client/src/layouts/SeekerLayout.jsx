import { Outlet } from "react-router-dom";
const UserLayout = () => {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
};

export default UserLayout;
