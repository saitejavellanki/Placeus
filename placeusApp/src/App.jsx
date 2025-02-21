import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllVideos from './pages/AllVideos';
import VideoPage from './pages/VideoPage'; // New page component for the video player
import VideoUpload from './pages/VideoUpload';
import Navbar from './components/Navbar';
//import FullStackRoadmap from './pages/Roadmaps';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/Reset';
import ProfilePage from './pages/Profile';
import ComingSoonPage from './pages/Community';
import QAPage from './pages/QandA';
import HomePage from './pages/Home';
import RoadmapPage from './pages/Roadmaps';
import CommunityEventsPage from './pages/Community';
import EventUploadForm from './pages/Event';
import UploadExperience from './pages/Experiece';
import ExperiencesList from './pages/List';
import SDERoadmap from './pages/Example';
import ArticleDisplayPage from './pages/Articles';
import ArticleUploadPage from './pages/UploadArticles';
import UploadPage from './pages/reels/ReelsUpload';
import DisplayPage from './pages/reels/ReelsDisplay';
import AlumniCards from './pages/Alumni';
import AlumniUploadForm from './pages/AlumniUpload';
import BookingPage from './pages/Booking';
import AdminDashboard from './pages/Admin';
import AdminBookingDashboard from './pages/Admin';
import AllArticlesPage from './pages/AllArticlesPage';


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
       <Route path="/" element={<HomePage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>} />
      <Route path="/reset" element={<ResetPassword />} />
      {/* <Route path="/profile" element={<ProfilePage />} /> */}
        <Route path="/all" element={<AllVideos />} />
        {/* <Route path="/video/:lessonId" element={<VideoPage />} />
        <Route path="/up" element={<VideoUpload/>} />  */}
        {/* <Route path="/roadmaps" element={<RoadmapPage/>} /> */}
        <Route path="/comm" element={<CommunityEventsPage/>} />
        <Route path="/qa" element={<QAPage/>} />
        {/* <Route path="/example" element={<SDERoadmap/>}/> */}
        {/* <Route path="/eventupload" element={<EventUploadForm/>} />*/}
        <Route path="/experience" element={<UploadExperience/>} />
        <Route path="/list" element={<ExperiencesList/>} /> 
        {/* <Route path="/articles" element={<ArticleDisplayPage/>} /> 
        <Route path="/articlesupload" element={<ArticleUploadPage/>} /> 
        <Route path="/Reelsupload" element={<UploadPage/>} /> 
        <Route path="/ReelsDisplay" element={<DisplayPage/>} /> 
        <Route path="/alumni" element={<AlumniCards/>} /> 
        <Route path="/alumniUpload" element={<AlumniUploadForm/>} /> 
        <Route path="/booking/:alumniId" element={<BookingPage />} />
        <Route path="/admin/bookings" element={<AdminBookingDashboard />} />
        <Route path="/articles/all" element={<AllArticlesPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
