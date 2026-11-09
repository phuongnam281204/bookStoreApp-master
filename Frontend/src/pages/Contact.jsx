import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";
import { contactInfo } from "../data/contactInfo";

function Contact() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="border-b border-line pb-6">
          <h1 className="font-display text-4xl font-medium md:text-5xl">
            {t("nav.contact")}
          </h1>
          <p className="mt-2 text-muted">{t("contact.subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <dl className="lg:col-span-5">
            <div className="border-b border-line pb-6">
              <dt className="text-sm text-muted">{t("contact.hotline")}</dt>
              <dd className="mt-2 flex flex-col">
                {contactInfo.phones.map((phone) => (
                  <a
                    key={phone.raw}
                    href={`tel:${phone.raw}`}
                    className="link-draw self-start py-1 font-display text-3xl font-medium"
                  >
                    {phone.label}
                  </a>
                ))}
              </dd>
            </div>

            <div className="border-b border-line py-6">
              <dt className="text-sm text-muted">{t("contact.email")}</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${contactInfo.supportEmail}`}
                  className="link-draw text-lg font-semibold text-accent"
                >
                  {contactInfo.supportEmail}
                </a>
              </dd>
            </div>

            <div className="border-b border-line py-6">
              <dt className="text-sm text-muted">{t("contact.address")}</dt>
              <dd className="mt-2 text-lg">{contactInfo.address}</dd>
            </div>

            <div className="py-6">
              <dt className="sr-only">Giờ mở cửa</dt>
              <dd className="text-lg">{t("contact.hours")}</dd>
            </div>
          </dl>

          <div className="overflow-hidden rounded-md border border-line bg-surface lg:col-span-7">
            <iframe
              title={`Bản đồ: ${contactInfo.address}`}
              src={contactInfo.mapSrc}
              className="block h-[420px] w-full lg:h-full lg:min-h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Contact;
