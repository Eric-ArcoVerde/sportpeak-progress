import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="safe-bottom pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
