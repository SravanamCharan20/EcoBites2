import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeUser } from './reducers/userSlice';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
// import PrivateRoute from './components/Privateroute';
import Header from './components/Header';
import DonorForm from './pages/Donate';
import AvailableFoodList from './pages/Avl';
import Fooddetails from './pages/Fooddetails';
import Addfood from './pages/Addfood';
import Managefood from './pages/Managefood';
import UpdateProfile from './pages/UpdateProfile';
import MyRequests from './pages/MyRequests';
import AddNonFood from './pages/AddNonFood';
import AvailableNonFood from './pages/AvailableNonFood';
import NonFoodDetails from './pages/NonFoodDetails';
import MyNonFoodRequests from './pages/MyNonFoodRequests';
// import About from './pages/About';
import UserProfile from './pages/UserProfile';
import ManageNonFood from './pages/ManageNonFood';
import Chats from './pages/Chats';
import OAuthCallback from './pages/OAuthCallback';
import PrivateRoute from './components/PrivateRoute';
import Analytics from './pages/Analytics';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  return (
    <>
      <div className='mb-16'>
        <Header/>
      </div>
      <Routes>
        {/* Public Routes */}
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/oauth/callback' element={<OAuthCallback />} />
        <Route path='/' element={<Home />} />
        {/* <Route path='/about' element={<About />} /> */}

        {/* Protected Routes */}
        <Route path='/analytics' element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        } />
        <Route path='/avl' element={
          <PrivateRoute>
            <AvailableFoodList />
          </PrivateRoute>
        } />
        <Route path='/avlnf' element={
          <PrivateRoute>
            <AvailableNonFood />
          </PrivateRoute>
        } />
        <Route path='/donate' element={
          <PrivateRoute>
            <DonorForm />
          </PrivateRoute>
        } />
        <Route path='/food-details/:id' element={
          <PrivateRoute>
            <Fooddetails />
          </PrivateRoute>
        } />
        <Route path='/nonfood-details/:id' element={
          <PrivateRoute>
            <NonFoodDetails />
          </PrivateRoute>
        } />
        <Route path='/addfood' element={
          <PrivateRoute>
            <Addfood />
          </PrivateRoute>
        } />
        <Route path='/addnonfood' element={
          <PrivateRoute>
            <AddNonFood />
          </PrivateRoute>
        } />
        <Route path='/managefood' element={
          <PrivateRoute>
            <Managefood />
          </PrivateRoute>
        } />
        <Route path='/userprofile' element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } />
        <Route path='/managenonfood' element={
          <PrivateRoute>
            <ManageNonFood />
          </PrivateRoute>
        } />
        <Route path='/update-profile' element={
          <PrivateRoute>
            <UpdateProfile/>
          </PrivateRoute>
        } />
        <Route path='/myrequests/:userId' element={
          <PrivateRoute>
            <MyRequests/>
          </PrivateRoute>
        } />
        <Route path='/requests-nonfood/:userId' element={
          <PrivateRoute>
            <MyNonFoodRequests/>
          </PrivateRoute>
        } />
        <Route path='/chats' element={
          <PrivateRoute>
            <Chats />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;