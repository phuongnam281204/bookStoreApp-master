import { contactInfo } from "../data/contactInfo";
import { useI18n } from "../context/I18nProvider";

function Footer() {
  const { t } = useI18n();
  const phoneLine = contactInfo.phones.map((phone) => phone.label).join(" / ");
  const noticeLines = t("footer.notice").split("\n");

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <div className="max-w-screen-2xl container mx-auto px-4 py-10 md:px-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.7fr]">
          <div className="space-y-4">
            <div className="text-3xl font-extrabold text-rose-600">
              bookStore.com
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {contactInfo.address}
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {noticeLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
              <iframe
                title="Google Map"
                src={contactInfo.mapSrc}
                className="h-48 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <a className="rounded-full border border-slate-200 p-2 hover:text-rose-600 dark:border-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a className="rounded-full border border-slate-200 p-2 hover:text-rose-600 dark:border-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.4 2.86 8.13 6.84 9.46.5.1.68-.22.68-.48 0-.24-.02-1.04-.02-1.88-2.78.6-3.36-1.18-3.36-1.18-.46-1.16-1.12-1.46-1.12-1.46-.92-.62.08-.6.08-.6 1.02.06 1.56 1.04 1.56 1.04.9 1.54 2.36 1.1 2.94.84.08-.66.36-1.1.66-1.36-2.22-.26-4.56-1.1-4.56-4.9 0-1.08.38-1.96 1-2.66-.1-.26-.44-1.3.1-2.7 0 0 .82-.26 2.7 1.02.78-.22 1.62-.32 2.46-.32.84 0 1.68.1 2.46.32 1.88-1.28 2.7-1.02 2.7-1.02.54 1.4.2 2.44.1 2.7.62.7 1 1.58 1 2.66 0 3.82-2.34 4.64-4.58 4.9.38.32.72.96.72 1.94 0 1.4-.02 2.52-.02 2.86 0 .26.18.6.7.48 3.98-1.32 6.84-5.06 6.84-9.46 0-5.5-4.46-9.96-9.96-9.96z" />
                </svg>
              </a>
              <a className="rounded-full border border-slate-200 p-2 hover:text-rose-600 dark:border-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:border-l lg:border-slate-200 lg:pl-10 dark:lg:border-slate-800">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                  {t("footer.services")}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>{t("footer.service.terms")}</li>
                  <li>{t("footer.service.privacy")}</li>
                  <li>{t("footer.service.payment")}</li>
                  <li>{t("footer.service.about")}</li>
                  <li>{t("footer.service.stores")}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                  {t("footer.support")}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>{t("footer.support.returns")}</li>
                  <li>{t("footer.support.warranty")}</li>
                  <li>{t("footer.support.shipping")}</li>
                  <li>{t("footer.support.wholesale")}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                  {t("footer.account")}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>{t("footer.account.login")}</li>
                  <li>{t("footer.account.address")}</li>
                  <li>{t("footer.account.details")}</li>
                  <li>{t("footer.account.history")}</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                {t("footer.contact")}
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-rose-500"
                  >
                    <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                  {contactInfo.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-rose-500"
                  >
                    <path d="M4 4h16v12H4z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  {contactInfo.supportEmail}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-rose-500"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.47-1.13a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62a2 2 0 0 1 1.72 2z" />
                  </svg>
                  {phoneLine}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
              <img
                src="https://cdn1.fahasa.com/media/wysiwyg/Logo-NCC/giao_hang_nhanh.png"
                alt="Giao Hang Nhanh"
                className="h-9 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="https://cdn1.fahasa.com/media/wysiwyg/Logo-NCC/Logo_viettel_post.png"
                alt="Viettel Post"
                className="h-9 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="https://cdn1.fahasa.com/media/wysiwyg/Logo-NCC/Shopee_express.png"
                alt="Shopee Express"
                className="h-9 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="https://cdn1.fahasa.com/media//wysiwyg/Logo-NCC/vnpay_logo.png"
                alt="VNPAY"
                className="h-9 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="https://cdn1.fahasa.com/media//wysiwyg/Logo-NCC/momopay.png"
                alt="MoMo"
                className="h-9 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
