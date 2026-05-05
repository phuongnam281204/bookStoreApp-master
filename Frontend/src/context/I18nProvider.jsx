import { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);
const STORAGE_KEY = "lang";

const messages = {
  vi: {
    "lang.name": "Tiếng Việt",
    "lang.toggle": "Chuyển ngôn ngữ",

    "theme.toggle": "Chuyển chế độ sáng/tối",

    "nav.home": "Trang chủ",
    "nav.course": "Sách",
    "nav.cart": "Giỏ hàng",
    "nav.contact": "Liên hệ",
    "nav.about": "Giới thiệu",
    "nav.search": "Tìm kiếm",
    "nav.searchPlaceholder": "Tìm tên sách, tác giả, nhà xuất bản...",
    "nav.login": "Đăng nhập",
    "nav.register": "Đăng ký",
    "nav.logout": "Đăng xuất",

    "course.searchResults": 'Hiển thị {{count}} kết quả cho "{{q}}"',
    "course.empty": "Không tìm thấy sản phẩm.",

    "banner.title": "Chào mừng bạn đến với",
    "banner.subtitle":
      "Khám phá hàng trăm tựa sách theo thể loại: văn học, kinh tế, kỹ năng, thiếu nhi… Chọn sách nhanh, thêm vào giỏ dễ dàng.",
    "banner.ctaFeatured": "Xem sách",
    "banner.ctaCategories": "Xem danh mục",

    "cards.buyNow": "Thêm vào giỏ",

    "cart.loginRequired": "Vui lòng đăng nhập để thêm vào giỏ hàng",

    "freebook.title": "Sách miễn phí",
    "freebook.desc":
      "Một vài lựa chọn miễn phí để bạn đọc thử trước khi quyết định mua.",

    "home.featured": "Sách nổi bật",
    "home.viewAll": "Xem tất cả",
    "home.categories": "Danh mục sản phẩm",
    "home.categoriesEmpty": "Chưa có danh mục.",

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

    "auth.fieldRequired": "Trường này bắt buộc",
    "auth.password.show": "Hiện mật khẩu",
    "auth.password.hide": "Ẩn mật khẩu",

    "auth.signup.title": "Đăng ký",
    "auth.signup.name": "Họ và tên",
    "auth.signup.email": "Email",
    "auth.signup.password": "Mật khẩu",
    "auth.signup.namePlaceholder": "Nhập họ và tên",
    "auth.signup.emailPlaceholder": "Nhập email",
    "auth.signup.passwordPlaceholder": "Nhập mật khẩu",
    "auth.signup.submit": "Đăng ký",
    "auth.signup.haveAccount": "Đã có tài khoản?",

    "auth.login.title": "Đăng nhập",
    "auth.login.email": "Email",
    "auth.login.password": "Mật khẩu",
    "auth.login.emailPlaceholder": "Nhập email",
    "auth.login.passwordPlaceholder": "Nhập mật khẩu",
    "auth.login.notRegistered": "Chưa có tài khoản?",
    "auth.login.signup": "Đăng ký",
  },
  en: {
    "lang.name": "English",
    "lang.toggle": "Switch language",

    "theme.toggle": "Toggle light/dark theme",

    "nav.home": "Home",
    "nav.course": "Books",
    "nav.cart": "Cart",
    "nav.contact": "Contact",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.searchPlaceholder": "Search by title, author, publisher...",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",

    "course.searchResults": 'Showing {{count}} result(s) for "{{q}}"',
    "course.empty": "No products found.",

    "banner.title": "Welcome to",
    "banner.subtitle":
      "Explore hundreds of books by category: fiction, business, skills, kids… Find quickly and add to cart easily.",
    "banner.ctaFeatured": "Browse books",
    "banner.ctaCategories": "View categories",

    "cards.buyNow": "Add to cart",

    "cart.loginRequired": "Please login to add items to cart",

    "freebook.title": "Free books",
    "freebook.desc": "A few free picks to try before you buy.",

    "home.featured": "Featured books",
    "home.viewAll": "View all",
    "home.categories": "Categories",
    "home.categoriesEmpty": "No categories yet.",

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

    "auth.fieldRequired": "This field is required",
    "auth.password.show": "Show password",
    "auth.password.hide": "Hide password",

    "auth.signup.title": "Signup",
    "auth.signup.name": "Name",
    "auth.signup.email": "Email",
    "auth.signup.password": "Password",
    "auth.signup.namePlaceholder": "Enter your fullname",
    "auth.signup.emailPlaceholder": "Enter your email",
    "auth.signup.passwordPlaceholder": "Enter your password",
    "auth.signup.submit": "Signup",
    "auth.signup.haveAccount": "Have account?",

    "auth.login.title": "Login",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.emailPlaceholder": "Enter your email",
    "auth.login.passwordPlaceholder": "Enter your password",
    "auth.login.notRegistered": "Not registered?",
    "auth.login.signup": "Signup",
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
