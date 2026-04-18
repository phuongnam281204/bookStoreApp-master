import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";

const address = "538/12 Lý Thường Kiệt, Phường Tân Sơn Nhất, TP.HCM";
const supportEmail = "namthuhai2812@gmail.com";
const phones = [
  { raw: "0363807312", label: "0363 807 312" },
  { raw: "0363257312", label: "0363 257 312" },
];
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  "538/12 Ly Thuong Kiet, Phuong Tan Son Nhat, Ho Chi Minh",
)}&output=embed`;

function Contact() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-10">
        <h1 className="text-2xl md:text-4xl font-bold">{t("nav.contact")}</h1>
        <p className="mt-3 opacity-80">
          Hỗ trợ đặt hàng, tư vấn sách và các thắc mắc khác.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body gap-6">
              <div>
                <div className="text-sm font-semibold">Hotline</div>
                <div className="mt-3 space-y-3">
                  {phones.map((phone) => (
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
                <div className="text-sm font-semibold">Địa chỉ</div>
                <p className="mt-2 opacity-80">{address}</p>
              </div>

              <div>
                <div className="text-sm font-semibold">Email</div>
                <a href={`mailto:${supportEmail}`} className="link mt-2 block">
                  {supportEmail}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm opacity-80">
                <div className="badge badge-success badge-sm" />
                <span>Mở cửa 8:00 — 21:00 hàng ngày</span>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
            <iframe
              title="Google Map"
              src={mapSrc}
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
