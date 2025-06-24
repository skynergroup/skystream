import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
