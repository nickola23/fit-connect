import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
