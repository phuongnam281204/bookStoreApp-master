import Navbar from "../components/Navbar";

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
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />

      <section className="bg-slate-950 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 py-14 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1
                className="text-4xl md:text-5xl font-light tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Get in
                <br />
                <span className="text-[#e8d5b0]">touch</span>
                <br />
                with us
              </h1>
            </div>
            <div className="text-sm leading-7 text-slate-300 md:pt-6">
              We are happy to help with orders, recommendations, and anything
              else.
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-screen-2xl mx-auto px-4 py-12 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[12px] border-[0.5px] border-slate-200 bg-white p-10">
            <div className="text-[10px] tracking-[2px] uppercase text-[#c0392b]">
              HOTLINE
            </div>

            <div className="mt-8 space-y-5">
              {phones.map((phone) => (
                <div key={phone.raw} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12 1.05.34 2.07.65 3.05a2 2 0 0 1-.45 2.11L9.91 10.09a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.11-.45c.98.31 2 .53 3.05.65A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <a
                    href={`tel:${phone.raw}`}
                    className="text-[20px] font-light text-slate-900"
                  >
                    {phone.label}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border-[0.5px] border-slate-200 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3cb05d]" />
              <span className="text-sm text-slate-600">
                Mở cửa 8:00 — 21:00 hàng ngày
              </span>
            </div>

            <div className="my-10 h-px w-20 bg-slate-300" />

            <div className="space-y-6 text-sm text-slate-600">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border-[0.5px] border-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M21 10.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 12.5 8.5 8.5 0 0 1 8.7 5.9 8.38 8.38 0 0 1 12.5 4h.1a8.5 8.5 0 0 1 8.4 8.5z" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    Địa chỉ cửa hàng
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border-[0.5px] border-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M4 4h16v16H4z" />
                    <polyline points="4 4 12 13 20 4" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    Email hỗ trợ
                  </div>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="mt-2 block text-[#c0392b]"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[12px] border-[0.5px] border-slate-200 bg-[#f5f3ef] min-h-[420px]">
            <iframe
              title="Google Map"
              src={mapSrc}
              className="h-full w-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute top-6 left-6 w-[260px] rounded-[10px] border-[0.5px] border-slate-200 bg-white p-4">
              <div className="text-lg font-semibold">bookStore</div>
              <p className="mt-2 text-sm text-slate-500 leading-5">
                538/12 Lý Thường Kiệt, Phường Tân Sơn Nhất, TP.HCM
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=538%2F12+Ly+Thuong+Kiet%2C+Phuong+Tan+Son+Nhat%2C+Ho+Chi+Minh"
                className="mt-3 inline-block text-[#c0392b]"
              >
                Xem trên Google Maps →
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-400 text-[11px]">
        <div className="max-w-screen-2xl mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 md:flex-row md:px-8">
          <div>© 2026 bookStore. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="#" className="hover:text-white">
              Chính sách bảo mật
            </a>
            <span>·</span>
            <a href="#" className="hover:text-white">
              Điều khoản
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
