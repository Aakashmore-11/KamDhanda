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
import SeekerLayout from "./layouts/SeekerLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";
import { FindProjects, SeekerHome } from "./pages/Seeker/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";

import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import useAuth from "./customHooks/useAuth";
import ClientDashboard from "./pages/Client/ClientDashboard";
import NewProject from "./pages/Client/NewProject";
import ClientHome from "./pages/Client/ClientHome";
import ProjectDetail from "./pages/Client/ProjectDetail";
import Loader from "./components/common/Loader";
import ApplyForm from "./pages/Seeker/ApplyForm";
import AppliedForm from "./pages/Seeker/AppliedForm";
import SeekerProfile from "./pages/Seeker/SeekerProfile";
import AllProposals from "./pages/Client/AllProposals";
import ProposalsDetail from "./pages/Client/ProposalsDetail";
import Messages from "./pages/Shared/Messages";
import ProjectTracking from "./pages/Shared/ProjectTracking";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageProjects from "./pages/Admin/ManageProjects";
import ManageSkills from "./pages/Admin/ManageSkills";
import ManageChats from "./pages/Admin/ManageChats";
import JobsFeed from "./pages/JobPortal/JobsFeed";
import JobDetails from "./pages/JobPortal/JobDetails";
import MyApplications from "./pages/JobPortal/MyApplications";
import PostJob from "./pages/JobPortal/PostJob";
import ManageJobs from "./pages/JobPortal/ManageJobs";
import AdminManageJobs from "./pages/Admin/ManageJobs";
import JobApplications from "./pages/JobPortal/JobApplications";
import ChangePassword from "./pages/Shared/ChangePassword";
import TransactionHistory from "./pages/Shared/TransactionHistory";
import AdminPayments from "./pages/Admin/AdminPayments";
import InterviewDashboard from "./pages/JobPortal/InterviewDashboard";
import InterviewRoom from "./components/HiringWorkflow/InterviewRoom";

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

  const rolePaths = {
    Seeker: "/seeker",
    Client: "/client",
    Admin: "/admin",
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element:
        user && role ? (
          <Navigate to={rolePaths[role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase()] || "/login"} replace />
        ) : (
          <Landing />
        ),
    },
    {
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
          children: [
            { path: "/seeker", element: <SeekerHome /> },
            { path: "findProjects", element: <FindProjects /> },
            { path: "applied-projects", element: <AppliedForm /> },
            { path: "profile", element: <SeekerProfile /> },
            { path: `project/:id/apply-form`, element: <ApplyForm /> },
            { path: `project/:id`, element: <ProjectDetail /> },
            { path: `project/:id/tracking`, element: <ProjectTracking /> },
            { path: "find-jobs", element: <JobsFeed /> },
            { path: "my-applications", element: <MyApplications /> },
            { path: "job/:id", element: <JobDetails /> },
            { path: "transactions", element: <TransactionHistory /> },
            { path: "interviews", element: <InterviewDashboard /> },
          ],
        },
        {
          path: "/client",
          element: (
            <ProtectedRoute allowedRoles={["Client"]}>
              <ClientLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "/client", element: <ClientHome /> },
            { path: "profile", element: <ClientDashboard /> },
            { path: "create-newProject", element: <NewProject /> },
            { path: "allProposals", element: <AllProposals /> },
            { path: `allProposals/:id`, element: <ProposalsDetail /> },
            { path: `project/:id`, element: <ProjectDetail /> },
            { path: `project/:id/tracking`, element: <ProjectTracking /> },
            { path: "post-job", element: <PostJob /> },
            { path: "manage-jobs", element: <ManageJobs /> },
            { path: "job-applications/:jobId", element: <JobApplications /> },
            { path: "transactions", element: <TransactionHistory /> },
            { path: "interviews", element: <InterviewDashboard /> },
          ],
        },
        {
          path: "/admin",
          element: (
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "/admin", element: <AdminDashboard /> },
            { path: "users", element: <ManageUsers /> },
            { path: "projects", element: <ManageProjects /> },
            { path: "jobs", element: <AdminManageJobs /> },
            { path: "skills", element: <ManageSkills /> },
            { path: "chats", element: <ManageChats /> },
            { path: "payments", element: <AdminPayments /> },
            { path: "profile", element: <Navigate to="/admin" replace /> },
          ],
        },
        {
          path: "/messages",
          element: (
            <ProtectedRoute allowedRoles={["Seeker", "Client", "Admin"]}>
              <Messages />
            </ProtectedRoute>
          )
        },
        {
          path: "/interview/room/:roomId",
          element: (
            <ProtectedRoute allowedRoles={["Seeker", "Client"]}>
              <InterviewRoom />
            </ProtectedRoute>
          )
        },
        {
          path: "change-password",
          element: (
            <ProtectedRoute allowedRoles={["Seeker", "Client", "Admin"]}>
              <ChangePassword />
            </ProtectedRoute>
          ),
        },

      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
  ]);

  if (authLoading) return <Loader />;
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
