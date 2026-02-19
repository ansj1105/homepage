import AdminPage from "./pages/AdminPage";
import PublicSite from "./pages/PublicSite";

const App = () => {
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  return isAdminRoute ? <AdminPage /> : <PublicSite />;
};

export default App;
