import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import RegisterTrainer from "@/pages/RegisterTrainer";
import {RegisterClient} from "@/pages/RegisterClient";
import Trainers from "@/pages/Trainers";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import EquipmentList from "@/pages/equipment/EquipmentList";
import EquipmentNew from "@/pages/equipment/EquipmentNew";
import EquipmentEdit from "@/pages/equipment/EquipmentEdit";
import AccessoriesList from "@/pages/equipment/AccessoriesList";
import AccessoriesNew from "@/pages/equipment/AccessoriesNew";
import AccessoriesEdit from "@/pages/equipment/AccessoriesEdit";
import TrainerHome from "@/pages/trainer/TrainerHome";
import TrainerProfile from "@/pages/trainer/TrainerProfile";
import TrainerProfileEdit from "@/pages/trainer/TrainerProfileEdit";
import ExerciseNew from "@/pages/trainer/ExerciseNew";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
        </Route>

        {/* Equipment catalog routes render their own shell (no shared Layout) */}
        <Route path="/my-equipment/equipment" element={<EquipmentList />} />
        <Route path="/my-equipment/equipment/new" element={<EquipmentNew />} />
        <Route path="/my-equipment/equipment/:id" element={<EquipmentEdit />} />
        <Route path="/my-equipment/accessory" element={<AccessoriesList />} />
        <Route path="/my-equipment/accessory/new" element={<AccessoriesNew />} />
        <Route path="/my-equipment/accessory/:id" element={<AccessoriesEdit />} />

        {/* Trainer routes render their own shell (no shared Layout) */}
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={["Trainer"]}>
              <TrainerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile"
          element={
            <ProtectedRoute allowedRoles={["Trainer"]}>
              <TrainerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile/edit"
          element={
            <ProtectedRoute allowedRoles={["Trainer"]}>
              <TrainerProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/exercises/new"
          element={
            <ProtectedRoute allowedRoles={["Trainer"]}>
              <ExerciseNew />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;