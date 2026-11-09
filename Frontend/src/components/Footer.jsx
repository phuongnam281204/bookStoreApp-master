import { Link } from "react-router-dom";
import { contactInfo } from "../data/contactInfo";
import { useI18n } from "../context/I18nProvider";

function FooterColumn({ title, items }) {
  return (
    <div className="lg:col-span-2">
      <h3 className="font-sans text-sm font-semibold tracking-normal">
        {title}
      </h3>
      <ul className="mt-3 text-sm text-muted">
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link
                to={item.to}
                className="link-draw inline-flex min-h-[36px] items-center hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex min-h-[36px] items-center">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  const noticeLines = t("footer.notice").split("\n");

  const links = (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-6">
      <div className="sm:col-span-2 lg:col-span-6">
        <Link to="/" className="inline-flex items-center gap-3 font-display text-3xl">
          <img
            src="/assets/img/logo.webp"
            alt=""
            width="44"
            height="44"
            className="h-11 w-11 rounded-xl"
            loading="lazy"
          />
          BookStore
        </Link>
        <div className="mt-3 max-w-md space-y-2 text-sm leading-6 text-muted">
          {noticeLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <a
            href={`mailto:${contactInfo.supportEmail}`}
            className="link-draw inline-flex min-h-[44px] items-center"
          >
            {contactInfo.supportEmail}
          </a>
        </p>
      </div>
      <FooterColumn
        title={t("footer.services")}
        items={[
          { label: t("footer.service.terms") },
          { label: t("footer.service.payment") },
          { label: t("footer.service.about"), to: "/about" },
        ]}
      />
      <FooterColumn
        title={t("footer.support")}
        items={[
          { label: t("footer.support.returns") },
          { label: t("footer.support.shipping") },
          { label: t("footer.support.wholesale") },
        ]}
      />
      <FooterColumn
        title={t("footer.account")}
        items={[
          { label: t("footer.account.history"), to: "/orders" },
          { label: t("nav.contact"), to: "/contact" },
        ]}
      />
    </div>
  );

  const legal = (
    <div className="mt-10 flex flex-col gap-2 text-xs text-muted lg:flex-row lg:justify-between">
      <p>{t("footer.partners")}</p>
      <p>{t("footer.copyright")}</p>
    </div>
  );

  return (
    <footer className="bg-paper text-ink">
      <div className="wrap py-16">
        {links}
        {legal}
      </div>
    </footer>
  );
}

export default Footer;
