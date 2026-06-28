import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import RegisterTrainer from "@/pages/RegisterTrainer";
import RegisterClient from "@/pages/RegisterClient";
import Trainers from "@/pages/Trainers";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/registration/trainer" element={<RegisterTrainer />} />
          <Route path="/registration/client" element={<RegisterClient />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;