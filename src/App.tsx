import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import AdminLogin from "./pages/AuthPages/AdminLogin";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// People Pages
import TeachersPage from "./pages/People/Teachers";
import StudentsPage from "./pages/People/Students";
import AdminsPage from "./pages/People/Admins";

// Test Pages
import TestsPage from "./pages/Test/Tests";
import TestResultsPage from "./pages/Test/TestResults";
import CertificatesPage from "./pages/Test/Certificates";

// Course Pages
import CoursesPage from "./pages/Courses/Courses";
import CategoriesPage from "./pages/Courses/Categories";
import VideosPage from "./pages/Courses/Videos";
import CourseSectionsPage from "./pages/Courses/CourseSections";
import FAQsPage from "./pages/Courses/FAQs";

// Marketing Pages
import BannersPage from "./pages/Marketing/Banners";
import PromoCodesPage from "./pages/Marketing/PromoCodes";

// Finance Pages
import PaymentsPage from "./pages/Finance/Payments";
import EnrollmentsPage from "./pages/Finance/Enrollments";

// Comments & Notifications
import CommentsPage from "./pages/Comments/Comments";
import NotificationsPage from "./pages/Notifications/Notifications";

// News Pages
import NewsPage from "./pages/News/News";
import NewsFormPage from "./pages/News/NewsForm";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Course Management */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/course-sections" element={<CourseSectionsPage />} />
            <Route path="/faqs" element={<FAQsPage />} />

            {/* People Management */}
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/admins" element={<AdminsPage />} />

            {/* Test Management */}
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/test-results" element={<TestResultsPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />

            {/* Marketing */}
            <Route path="/banners" element={<BannersPage />} />
            <Route path="/promo-codes" element={<PromoCodesPage />} />

            {/* Finance */}
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/enrollments" element={<EnrollmentsPage />} />

            {/* Comments & Notifications */}
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* News */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/create" element={<NewsFormPage />} />
            <Route path="/news/edit/:id" element={<NewsFormPage />} />

            {/* Others */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* UI Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} />
    </>
  );
}
