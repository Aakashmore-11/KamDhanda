import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { handleErrorMsg, handleSuccessMsg } from "../../config/toast";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      const res = await axios.get(`${serverObj.serverAPI}/user/logoutUser`, {
        withCredentials: true,
      });
      dispatch(logoutUser());
      handleSuccessMsg(res.data.message);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      handleErrorMsg(err?.response?.data.message || err.message);
    }
  };

  return (
    <div className="flex justify-center mt-5">
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-6 py-2 
                   bg-gradient-to-r from-red-500 to-red-600 
                   text-white font-semibold rounded-full 
                   shadow-lg hover:shadow-xl 
                   hover:scale-105 transform transition-all duration-300
                   focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
