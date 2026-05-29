import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const Landing       = lazy(() => import("./pages/Landing"));
const Login         = lazy(() => import("./pages/Login"));
const Register      = lazy(() => import("./pages/Register"));
const ForgotPassword= lazy(() => import("./pages/ForgotPassword"));
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Builder       = lazy(() => import("./pages/Builder"));
const Templates     = lazy(() => import("./pages/Templates"));
const Analytics     = lazy(() => import("./pages/Analytics"));
const Settings      = lazy(() => import("./pages/Settings"));
const NotFound      = lazy(() => import("./pages/NotFound"));

function Loader() {
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
                  flexDirection:"column",gap:20 }}>
      <div style={{ width:50,height:50,borderRadius:14,background:"linear-gradient(135deg,var(--gold-500),var(--gold-300))",
                    display:"flex",alignItems:"center",justifyContent:"center" }}>
        <span style={{ color:"var(--navy-900)",fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem" }}>R</span>
      </div>
      <div style={{ width:40,height:40,borderRadius:"50%",border:"3px solid rgba(201,168,76,.15)",
                    borderTopColor:"var(--gold-500)",animation:"spin .9s linear infinite" }}/>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loader/>;
  if (!isAuth) return <Navigate to="/login" state={{ from: loc }} replace/>;
  return children;
}

function PublicRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <Loader/>;
  if (isAuth) return <Navigate to="/dashboard" replace/>;
  return children;
}

export default function App() {
  return (
    <>
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true"/>
      <div className="orb orb-2" aria-hidden="true"/>
      <div className="orb orb-3" aria-hidden="true"/>

      <div style={{ position:"relative",zIndex:1 }}>
        <Suspense fallback={<Loader/>}>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Landing/>}/>
            <Route path="/login"          element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path="/register"       element={<PublicRoute><Register/></PublicRoute>}/>
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword/></PublicRoute>}/>

            {/* Protected */}
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
            <Route path="/builder"     element={<ProtectedRoute><Builder/></ProtectedRoute>}/>
            <Route path="/builder/:id" element={<ProtectedRoute><Builder/></ProtectedRoute>}/>
            <Route path="/templates"   element={<ProtectedRoute><Templates/></ProtectedRoute>}/>
            <Route path="/analytics"   element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
            <Route path="/settings"    element={<ProtectedRoute><Settings/></ProtectedRoute>}/>

            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
