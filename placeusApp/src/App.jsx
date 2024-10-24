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


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
       <Route path="/" element={<HomePage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/profile" element={<ProfilePage />} />
        <Route path="/all" element={<AllVideos />} />
        <Route path="/video/:lessonId" element={<VideoPage />} />
        <Route path="/up" element={<VideoUpload/>} /> 
        <Route path="/roadmaps" element={<RoadmapPage/>} />
        <Route path="/comm" element={<CommunityEventsPage/>} />
        <Route path="/qa" element={<QAPage/>} />
        <Route path="/example" element={<SDERoadmap/>}/>
        {/* <Route path="/eventupload" element={<EventUploadForm/>} />*/}
        <Route path="/experience" element={<UploadExperience/>} />
        <Route path="/list" element={<ExperiencesList/>} /> 
        <Route path="/articles" element={<ArticleDisplayPage/>} /> 
        <Route path="/articlesupload" element={<ArticleUploadPage/>} /> 

      </Routes>
    </Router>
  );
}

export default App;
