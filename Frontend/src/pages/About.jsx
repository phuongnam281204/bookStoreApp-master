import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";

function About() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">{t("about.title")}</h1>
        <p className="mt-4 opacity-80">{t("about.desc")}</p>
      </div>
      <Footer />
    </>
  );
}

export default About;
