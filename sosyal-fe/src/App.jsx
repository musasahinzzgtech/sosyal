import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import store from './store';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
