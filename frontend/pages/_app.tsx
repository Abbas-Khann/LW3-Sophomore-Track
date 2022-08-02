import '../styles/globals.css'
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }) {
  return <>
  <Component {...pageProps} />
  <ToastContainer
      theme='dark'
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      />
  </>
}

export default MyApp
