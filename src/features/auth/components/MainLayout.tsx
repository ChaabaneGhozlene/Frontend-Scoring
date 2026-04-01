import { Outlet } from 'react-router-dom';
import Navbar from '../../navbar/Navbar';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, background: '#f8f9fa' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;