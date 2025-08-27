import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import store from "./store";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import MyProfile from "./pages/MyProfile";
import Cekici from "./pages/Cekici";
import IsletmeProfili from "./pages/IsletmeProfili";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="hakkimizda" element={<About />} />
              <Route path="iletisim" element={<Contact />} />
              <Route path="kayit-ol" element={<Register />} />
              <Route path="giris-yap" element={<Login />} />
              <Route path="mesajlar" element={<Messages />} />
              <Route path="profilim" element={<MyProfile />} />
              <Route path="cekici-hizmetleri" element={<Cekici />} />
              <Route path="isletme/:id" element={<IsletmeProfili />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
