import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">About</h1>
        <p className="mt-4 opacity-80">
          BookStore demo app built with React + Vite and an Express + MongoDB
          backend.
        </p>
      </div>
      <Footer />
    </>
  );
}

export default About;
