import { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);
const STORAGE_KEY = "lang";

const messages = {
  vi: {
    "lang.name": "Tiếng Việt",
    "lang.toggle": "Chuyển ngôn ngữ",

    "nav.home": "Trang chủ",
    "nav.course": "Sách",
    "nav.cart": "Giỏ hàng",
    "nav.contact": "Liên hệ",
    "nav.about": "Giới thiệu",
    "nav.search": "Tìm kiếm",
    "nav.login": "Đăng nhập",
    "nav.logout": "Đăng xuất",

    "banner.title": "Chào mừng bạn đến với",
    "banner.subtitle":
      "Khám phá hàng trăm tựa sách theo thể loại: văn học, kinh tế, kỹ năng, thiếu nhi… Chọn sách nhanh, thêm vào giỏ dễ dàng.",
    "banner.ctaFeatured": "Xem sách",
    "banner.ctaCategories": "Xem danh mục",

    "cards.buyNow": "Thêm vào giỏ",

    "freebook.title": "Sách miễn phí",
    "freebook.desc":
      "Một vài lựa chọn miễn phí để bạn đọc thử trước khi quyết định mua.",

    "footer.about": "Về chúng tôi",
    "footer.contact": "Liên hệ",
    "footer.jobs": "Tuyển dụng",
    "footer.press": "Bộ tài liệu",
    "footer.copyright":
      "Copyright © 2024 - All right reserved by ACME Industries Ltd",

    "auth.toast.signupSuccess": "Đăng ký thành công",
    "auth.toast.signupFailed": "Đăng ký thất bại",
    "auth.toast.loginSuccess": "Đăng nhập thành công",
    "auth.toast.loginFailed": "Đăng nhập thất bại",
    "auth.toast.logoutSuccess": "Đăng xuất thành công",
  },
  en: {
    "lang.name": "English",
    "lang.toggle": "Switch language",

    "nav.home": "Home",
    "nav.course": "Books",
    "nav.cart": "Cart",
    "nav.contact": "Contact",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.login": "Login",
    "nav.logout": "Logout",

    "banner.title": "Welcome to",
    "banner.subtitle":
      "Explore hundreds of books by category: fiction, business, skills, kids… Find quickly and add to cart easily.",
    "banner.ctaFeatured": "Browse books",
    "banner.ctaCategories": "View categories",

    "cards.buyNow": "Add to cart",

    "freebook.title": "Free books",
    "freebook.desc": "A few free picks to try before you buy.",

    "footer.about": "About us",
    "footer.contact": "Contact",
    "footer.jobs": "Jobs",
    "footer.press": "Press kit",
    "footer.copyright":
      "Copyright © 2024 - All right reserved by ACME Industries Ltd",

    "auth.toast.signupSuccess": "Signup successfully",
    "auth.toast.signupFailed": "Signup failed",
    "auth.toast.loginSuccess": "Logged in successfully",
    "auth.toast.loginFailed": "Login failed",
    "auth.toast.logoutSuccess": "Logout successfully",
  },
};

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

export default function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "vi" ? saved : "vi";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo(() => {
    const dict = messages[lang] || messages.vi;

    const t = (key, vars) => {
      const raw = dict[key] ?? messages.vi[key] ?? key;
      return interpolate(raw, vars);
    };

    const toggleLang = () => setLang((prev) => (prev === "vi" ? "en" : "vi"));

    return { lang, setLang, toggleLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
