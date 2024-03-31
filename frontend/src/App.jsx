import Chart from 'chart.js/auto';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';

function App() {
  return (
    <>
      <ToastContainer />
      <Home/>
    </>
  );
}

export default App;
