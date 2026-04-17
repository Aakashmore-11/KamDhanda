// App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addUser, logoutUser } from "./store/slices/authSlice";
import { serverObj } from "./config/serverConfig";
import MainLayout from "./layouts/MainLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import CompanyLayout from "./layouts/CompanyLayout";
import SeekerLayout from "./layouts/SeekerLayout";

import { FindJob, SeekerHome } from "./pages/Seeker/Index";
import {} from "./pages/Recruiter/Index";
import { CreateCompany } from "./pages/Company/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import CompanyProfile from "./pages/Company/CompanyProfile";
import AllRecruiters from "./pages/Company/AllRecruiters";
import useAuth from "./customHooks/useAuth";
import CreateProfileRec from "./pages/Recruiter/CreateProfileRec";
import RecruiterProfile from "./pages/Recruiter/RecruiterProfile";

const App = () => {
  const serverAPI = serverObj.serverAPI;
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${serverAPI}/user/getCurrentUser`, {
          withCredentials: true,
        });
        dispatch(addUser({ user: res.data.user, role: res.data.user.role }));
      } catch {
        dispatch(logoutUser());
      } finally {
        setAuthLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (authLoading) return <h1>Loading...</h1>;

  const rolePaths = {
    Seeker: "/seeker",
    Recruiter: "/recruiter",
    Company: "/company",
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        // Role-based homepages
        {
          path: "/seeker",
          element: (
            <ProtectedRoute allowedRoles={["Seeker"]}>
              <SeekerLayout />
            </ProtectedRoute>
          ),
          children: [{ path: "/seeker", element: <SeekerHome /> }],
        },
        {
          path: "/recruiter",
          element: (
            <ProtectedRoute allowedRoles={["Recruiter"]}>
              <RecruiterLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "", element: <RecruiterProfile /> },
            { path: "create-recruiter-profile", element: <CreateProfileRec /> },
          ],
        },
        {
          path: "/company",
          element: (
            <ProtectedRoute allowedRoles={["Company"]}>
              <CompanyLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "", element: <CompanyProfile /> },
            { path: "create-company", element: <CreateCompany /> },
            { path: "all-recruiters", element: <AllRecruiters /> },
          ],
        },

        // Default redirect
        {
          path: "/",
          element:
            user && role ? (
              <Navigate to={rolePaths[role]} replace />
            ) : (
              <Navigate to="/login" replace />
            ),
        },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "text-sm rounded-md shadow-lg ",
          duration: 1500,
          style: {
            background: "#1f2937", // Tailwind gray-800
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#10b981", // Tailwind green-500
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // Tailwind red-500
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
};

export default App;
