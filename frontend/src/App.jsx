import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeUser } from './reducers/userSlice';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Home from './pages/Home';
import PrivateRoute from './components/Privateroute';
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
import About from './pages/About';
import UserProfile from './pages/UserProfile';
import ManageNonFood from './pages/ManageNonFood';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  return (
    <Provider store={store}>
      <BrowserRouter>
      <div className='mb-16'>
      <Header/>
      </div>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/' element={<Home />} />
          {/* <Route path='/about' element={<About />} /> */}
          <Route path='/avl' element={<AvailableFoodList />} />
          <Route path='/avlnf' element={<AvailableNonFood />} />
          <Route path='/donate' element={<DonorForm />} />
          <Route path='/food-details/:id' element={<Fooddetails />} />
          <Route path='/nonfood-details/:id' element={<NonFoodDetails />} />
          <Route path='/addfood' element={<Addfood />} />
          <Route path='/addnonfood' element={<AddNonFood />} />
          <Route path='/managefood' element={<Managefood />} />
          <Route path='/userprofile' element={<UserProfile />} />
          <Route path='/managenonfood' element={<ManageNonFood />} />
          <Route path='/update-profile' element={<UpdateProfile/>} />
          <Route path='/myrequests/:userId' element={<MyRequests/>} />
          <Route path='/requests-nonfood/:userId' element={<MyNonFoodRequests/>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;