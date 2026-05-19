import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";
import { contactInfo } from "../data/contactInfo";

function Contact() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-10">
        <h1 className="text-2xl md:text-4xl font-bold">{t("nav.contact")}</h1>
        <p className="mt-3 opacity-80">{t("contact.subtitle")}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body gap-6">
              <div>
                <div className="text-sm font-semibold">
                  {t("contact.hotline")}
                </div>
                <div className="mt-3 space-y-3">
                  {contactInfo.phones.map((phone) => (
                    <a
                      key={phone.raw}
                      href={`tel:${phone.raw}`}
                      className="btn btn-ghost justify-start w-full"
                    >
                      {phone.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="divider my-0" />

              <div>
                <div className="text-sm font-semibold">
                  {t("contact.address")}
                </div>
                <p className="mt-2 opacity-80">{contactInfo.address}</p>
              </div>

              <div>
                <div className="text-sm font-semibold">
                  {t("contact.email")}
                </div>
                <a
                  href={`mailto:${contactInfo.supportEmail}`}
                  className="link mt-2 block"
                >
                  {contactInfo.supportEmail}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm opacity-80">
                <div className="badge badge-success badge-sm" />
                <span>{t("contact.hours")}</span>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
            <iframe
              title="Google Map"
              src={contactInfo.mapSrc}
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
