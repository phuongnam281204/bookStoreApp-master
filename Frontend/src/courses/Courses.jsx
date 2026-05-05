import Navbar from "../components/Navbar";
import Course from "../components/Course";
import Footer from "../components/Footer";
function Courses() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-100 dark:bg-slate-900">
        <Course />
      </div>
      <Footer />
    </>
  );
}

export default Courses;
