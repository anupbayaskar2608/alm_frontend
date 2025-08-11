import {BrowserRouter as  Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Loginpage from './Login_Page/Loginpage';
import Dashboard from './Dashboard/Dashboard';
import Users from './Dashboard/Users/Users';
import Regions from './Dashboard/Regions/Regions';
import Departments from './Dashboard/Departments/Departments';
import Services from './Dashboard/Services alm/Services';
import Securitygroup from './Dashboard/Security_Group/Securitygroup';
import Appprofile from './Dashboard/App_Profile/Appprofile';
import Workloads from './Dashboard/Work_Loads/Workloads';
import Appmapping from './Dashboard/App_Mapping/Appmapping';
import Networkprofile from './Dashboard/Network_Profile/Networkprofile';
import Usersform from './Dashboard/Users/Usersform';

function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
      <Route path="/" element={<Loginpage/>}/>
      <Route path="userform" element={<Usersform/>}/>
      <Route path="/userform/:userId" element={<Usersform />} /> 
      <Route path="/dashboard" element={<Dashboard />}>
            <Route path="users" element={<Users/>} /> 
            < Route path="regions" element={<Regions/>}/>
            < Route path="departments" element={<Departments/>}/>
            < Route path="services" element={<Services/>}/>
            < Route path="securitygroup" element={<Securitygroup/>}/>
            < Route path="appprofile" element={<Appprofile/>}/>
            < Route path="workloads" element={<Workloads/>}/>
            <Route path="appmapping" element={<Appmapping/>}/>
            <Route path="networkprofile" element={<Networkprofile/>}/>
          </Route>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
