import { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);
const STORAGE_KEY = "lang";

const messages = {
  vi: {
    "lang.name": "Tiếng Việt",
    "lang.toggle": "Chuyển ngôn ngữ",

    "theme.toggle": "Chuyển chế độ sáng/tối",

    "nav.home": "Trang chủ",
    "nav.course": "Danh mục sản phẩm",
    "nav.cart": "Giỏ hàng",
    "nav.contact": "Liên hệ",
    "nav.about": "Giới thiệu",
    "nav.menu": "Menu",
    "nav.search": "Tìm kiếm",
    "nav.searchPlaceholder": "Tìm tên sách, tác giả, nhà xuất bản...",
    "nav.login": "Đăng nhập",
    "nav.register": "Đăng ký",
    "nav.logout": "Đăng xuất",

    "course.searchResults": 'Hiển thị {{count}} kết quả cho "{{q}}"',
    "course.empty": "Không tìm thấy sản phẩm.",

    "banner.title": "Chào mừng bạn đến với",
    "banner.taglineBefore": "Mỗi cuốn sách là",
    "banner.taglineHighlight": "một thế giới",
    "banner.taglineAfter": "chưa được khám phá",
    "banner.subtitle":
      "Khám phá hàng trăm tựa sách theo thể loại: văn học, kinh tế, kỹ năng, thiếu nhi… Chọn sách nhanh, thêm vào giỏ dễ dàng.",
    "banner.ctaFeatured": "Xem sách",
    "banner.ctaCategories": "Khám phá ngay",

    "cards.buyNow": "Thêm vào giỏ",

    "cart.loginRequired": "Vui lòng đăng nhập để thêm vào giỏ hàng",

    "freebook.title": "Sách miễn phí",
    "freebook.desc":
      "Một vài lựa chọn miễn phí để bạn đọc thử trước khi quyết định mua.",

    "home.featured": "Sách nổi bật",
    "home.viewAll": "Xem tất cả",
    "home.newArrivals": "Sách mới",
    "home.newArrivalsEmpty": "Chưa có sách mới trong tuần.",
    "home.categories": "Danh mục sản phẩm",
    "home.categoriesEmpty": "Chưa có danh mục.",
    "home.categoriesPrev": "Xem danh mục trước",
    "home.categoriesNext": "Xem danh mục tiếp theo",

    "about.title": "Giới thiệu",
    "about.desc":
      "Ứng dụng bookStore demo xây dựng bằng React + Vite và backend Express + MongoDB.",

    "footer.services": "DỊCH VỤ",
    "footer.support": "HỖ TRỢ",
    "footer.account": "TÀI KHOẢN CỦA TÔI",
    "footer.contact": "LIÊN HỆ",
    "footer.notice":
      "bookStore.com nhận đặt hàng trực tuyến và giao hàng tận nơi.\nKHÔNG hỗ trợ đặt mua và nhận hàng trực tiếp tại văn phòng cũng như tất cả Hệ thống bookStore trên toàn quốc.",
    "footer.service.terms": "Điều khoản sử dụng",
    "footer.service.privacy": "Chính sách bảo mật thông tin cá nhân",
    "footer.service.payment": "Chính sách bảo mật thanh toán",
    "footer.service.about": "Giới thiệu bookStore",
    "footer.service.stores": "Hệ thống nhà sách",
    "footer.support.returns": "Chính sách đổi - trả - hoàn tiền",
    "footer.support.warranty": "Chính sách bảo hành - bồi hoàn",
    "footer.support.shipping": "Chính sách vận chuyển",
    "footer.support.wholesale": "Chính sách khách sỉ",
    "footer.account.login": "Đăng nhập/Tạo mới tài khoản",
    "footer.account.address": "Thay đổi địa chỉ khách hàng",
    "footer.account.details": "Chi tiết tài khoản",
    "footer.account.history": "Lịch sử mua hàng",
    "footer.copyright": "Copyright © 2024 - All right reserved by bookStore",

    "contact.subtitle": "Hỗ trợ đặt hàng, tư vấn sách và các thắc mắc khác.",
    "contact.hotline": "Hotline",
    "contact.address": "Địa chỉ",
    "contact.email": "Email",
    "contact.hours": "Mở cửa 8:00 — 21:00 hàng ngày",

    "checkout.title": "THANH TOÁN",
    "checkout.empty": "Giỏ hàng trống. Vui lòng quay lại",
    "checkout.cartLink": "giỏ hàng",
    "checkout.shippingTitle": "Địa chỉ giao hàng",
    "checkout.fullName": "Họ và tên người nhận",
    "checkout.fullNamePlaceholder": "Nhập họ và tên người nhận",
    "checkout.email": "Email",
    "checkout.emailPlaceholder": "Nhập email",
    "checkout.phone": "Số điện thoại",
    "checkout.phonePlaceholder": "Ví dụ: 0978123xxx",
    "checkout.country": "Quốc gia",
    "checkout.countryPlaceholder": "Việt Nam",
    "checkout.city": "Tỉnh/Thành phố",
    "checkout.cityPlaceholder": "Chọn tỉnh/thành phố",
    "checkout.district": "Quận/Huyện",
    "checkout.districtPlaceholder": "Chọn quận/huyện",
    "checkout.ward": "Phường/Xã",
    "checkout.wardPlaceholder": "Chọn phường/xã",
    "checkout.addressLine": "Địa chỉ nhận hàng",
    "checkout.addressLinePlaceholder": "Nhập địa chỉ nhận hàng",
    "checkout.shippingMethod": "Phương thức vận chuyển",
    "checkout.shippingNote":
      "Quý khách vui lòng điền sẵn địa chỉ giao nhận trước.",
    "checkout.paymentMethod": "Phương thức thanh toán",
    "checkout.paymentMomo": "Ví MoMo",
    "checkout.paymentVnpay": "VNPAY",
    "checkout.paymentCod": "Thanh toán bằng tiền mặt khi nhận hàng (COD)",
    "checkout.voucherTitle": "Mã khuyến mãi / Gift card",
    "checkout.voucherPlaceholder": "Nhập mã khuyến mãi",
    "checkout.voucherApply": "Áp dụng",
    "checkout.voucherRemove": "Bỏ mã",
    "checkout.voucherPick": "Chọn khuyến mãi",
    "checkout.voucherApplied": "Đã áp dụng",
    "checkout.voucherExpires": "hết hạn",
    "checkout.voucherGuide": "Hướng dẫn sử dụng Gift Card",
    "checkout.voucherEmpty": "Vui lòng nhập mã khuyến mãi",
    "checkout.voucherLogin": "Vui lòng đăng nhập để áp dụng mã",
    "checkout.voucherAppliedToast": "Áp dụng mã thành công",
    "checkout.voucherInvalid": "Mã không hợp lệ",
    "checkout.voucherFailed": "Không thể áp dụng mã",
    "checkout.otherInfo": "Thông tin khác",
    "checkout.invoice": "Xuất hóa đơn GTGT",
    "checkout.notePlaceholder": "Ghi chú",
    "checkout.invoiceNote":
      "Lưu ý: Chỉ xuất hóa đơn cho đơn hàng có thông tin đầy đủ và chính xác.",
    "checkout.orderReview": "Kiểm tra lại đơn hàng",
    "checkout.subtotal": "Tạm tính",
    "checkout.discount": "Giảm giá",
    "checkout.total": "Tổng cộng",
    "checkout.shippingFee": "Phí vận chuyển",
    "checkout.shippingFeeFree": "0đ",
    "checkout.totalWithVat": "Tổng số tiền (gồm VAT)",
    "checkout.confirmPayment": "Xác nhận thanh toán",
    "checkout.termsNote":
      "Bằng việc tiến hành mua hàng, bạn đã đồng ý với điều khoản & điều kiện của bookStore.",
    "checkout.placeOrder": "Đặt hàng",
    "checkout.emptyCart": "Giỏ hàng trống",
    "checkout.loginRequired": "Vui lòng đăng nhập để thanh toán",
    "checkout.placeSuccess": "Đặt hàng thành công",
    "checkout.placeFailed": "Đặt hàng thất bại",

    "orders.title": "Đơn hàng của tôi",
    "orders.subtitle": "Theo dõi trạng thái và hủy đơn chưa thanh toán.",
    "orders.reload": "Tải lại",
    "orders.loading": "Đang tải...",
    "orders.empty": "Bạn chưa có đơn hàng nào.",
    "orders.code": "Mã đơn",
    "orders.address": "Địa chỉ",
    "orders.details": "Xem chi tiết sản phẩm",
    "orders.cancel": "Hủy đơn",
    "orders.cancelTitle": "Xác nhận hủy đơn",
    "orders.cancelQuestion": "Bạn có chắc chắn muốn hủy đơn hàng này không?",
    "orders.back": "Quay lại",
    "orders.confirmCancel": "Xác nhận hủy",
    "orders.cancelSuccess": "Đã hủy đơn",
    "orders.cancelFailed": "Hủy đơn thất bại",
    "orders.loadFailed": "Không tải được",
    "orders.status.paid": "Đã thanh toán",
    "orders.status.cancelled": "Đã hủy",
    "orders.status.placed": "Đã đặt",
    "orders.payment.paid": "Đã thanh toán",
    "orders.payment.pending": "Đang xử lý",
    "orders.payment.failed": "Thất bại",
    "orders.payment.unpaid": "Chưa thanh toán",

    "payment.successTitle": "Thanh toán thành công",
    "payment.successDesc":
      "Đơn hàng của bạn đã được ghi nhận. Cảm ơn bạn đã mua hàng!",
    "payment.failedTitle": "Thanh toán thất bại",
    "payment.failedDesc":
      "Giao dịch không thành công hoặc đã bị hủy. Bạn có thể thử lại.",
    "payment.missingOrder": "Thiếu mã đơn hàng để xác nhận thanh toán",
    "payment.failedToast": "Thanh toán thất bại",
    "payment.notVerified": "Thanh toán chưa được xác nhận",
    "payment.verifyFailed": "Không thể xác nhận thanh toán",
    "payment.verifying": "Đang xác nhận giao dịch...",
    "payment.orderCode": "Mã đơn",
    "payment.reason": "Mã lỗi",
    "payment.viewOrders": "Xem đơn hàng",
    "payment.backToCheckout": "Quay lại thanh toán",
    "payment.backHome": "Về trang chủ",
    "payment.badgeSuccess": "THÀNH CÔNG",
    "payment.badgeFailed": "THẤT BẠI",

    "auth.googleLoadFailed": "Không thể tải đăng nhập Google",
    "auth.forgot": "Quên mật khẩu?",
    "auth.forgotTitle": "Quên mật khẩu",
    "auth.forgotDesc": "Nhập email để nhận link đặt lại mật khẩu.",
    "auth.forgotEmailPlaceholder": "Nhập email",
    "auth.forgotSend": "Gửi link",
    "auth.cancel": "Hủy",
    "auth.forgotEmailRequired": "Vui lòng nhập email",
    "auth.forgotResetLink": "Link reset (dev): ",
    "auth.forgotSent": "Nếu email tồn tại, link khôi phục sẽ được gửi",
    "auth.forgotFailed": "Không thể gửi yêu cầu",

    "reset.title": "Đặt lại mật khẩu",
    "reset.subtitle": "Nhập mật khẩu mới cho tài khoản của bạn.",
    "reset.newPassword": "Mật khẩu mới",
    "reset.newPasswordPlaceholder": "Ít nhất 8 ký tự, gồm chữ và số",
    "reset.confirmPassword": "Nhập lại mật khẩu",
    "reset.confirmPasswordPlaceholder": "Nhập lại mật khẩu",
    "reset.submit": "Cập nhật mật khẩu",
    "reset.submitting": "Đang xử lý...",
    "reset.missingToken": "Thiếu token đặt lại mật khẩu",
    "reset.weakPassword": "Mật khẩu phải >= 8 ký tự, gồm chữ và số",
    "reset.mismatch": "Mật khẩu xác nhận không khớp",
    "reset.success": "Đặt lại mật khẩu thành công",
    "reset.failed": "Đặt lại thất bại",

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
    "auth.login.or": "Hoặc",
    "auth.login.google": "Tiếp tục với Google",
    "auth.login.googleNotConfigured": "Chưa cấu hình đăng nhập Google",
  },
  en: {
    "lang.name": "English",
    "lang.toggle": "Switch language",

    "theme.toggle": "Toggle light/dark theme",

    "nav.home": "Home",
    "nav.course": "Products",
    "nav.cart": "Cart",
    "nav.contact": "Contact",
    "nav.about": "About",
    "nav.menu": "Menu",
    "nav.search": "Search",
    "nav.searchPlaceholder": "Search by title, author, publisher...",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",

    "course.searchResults": 'Showing {{count}} result(s) for "{{q}}"',
    "course.empty": "No products found.",

    "banner.title": "Welcome to",
    "banner.taglineBefore": "Every book is",
    "banner.taglineHighlight": "a world",
    "banner.taglineAfter": "yet to be discovered",
    "banner.subtitle":
      "Explore hundreds of books by category: fiction, business, skills, kids… Find quickly and add to cart easily.",
    "banner.ctaFeatured": "Browse books",
    "banner.ctaCategories": "Explore now",

    "cards.buyNow": "Add to cart",

    "cart.loginRequired": "Please login to add items to cart",

    "freebook.title": "Free books",
    "freebook.desc": "A few free picks to try before you buy.",

    "home.featured": "Featured books",
    "home.viewAll": "View all",
    "home.categories": "Categories",
    "home.categoriesEmpty": "No categories yet.",
    "home.categoriesPrev": "Previous categories",
    "home.categoriesNext": "Next categories",

    "about.title": "About",
    "about.desc":
      "bookStore demo app built with React + Vite and an Express + MongoDB backend.",

    "footer.services": "SERVICES",
    "footer.support": "SUPPORT",
    "footer.account": "MY ACCOUNT",
    "footer.contact": "CONTACT",
    "footer.notice":
      "bookStore.com accepts online orders and delivers nationwide.\nWe do NOT support direct pickup at the office or any bookStore system nationwide.",
    "footer.service.terms": "Terms of use",
    "footer.service.privacy": "Privacy policy",
    "footer.service.payment": "Payment security",
    "footer.service.about": "About bookStore",
    "footer.service.stores": "Bookstore system",
    "footer.support.returns": "Returns & refunds",
    "footer.support.warranty": "Warranty & compensation",
    "footer.support.shipping": "Shipping policy",
    "footer.support.wholesale": "Wholesale policy",
    "footer.account.login": "Login/Create account",
    "footer.account.address": "Manage address",
    "footer.account.details": "Account details",
    "footer.account.history": "Order history",
    "footer.copyright": "Copyright © 2024 - All right reserved by bookStore",

    "contact.subtitle": "Order support, book advice, and other inquiries.",
    "contact.hotline": "Hotline",
    "contact.address": "Address",
    "contact.email": "Email",
    "contact.hours": "Open 8:00 — 21:00 daily",

    "checkout.title": "CHECKOUT",
    "checkout.empty": "Your cart is empty. Please return to",
    "checkout.cartLink": "your cart",
    "checkout.shippingTitle": "Shipping address",
    "checkout.fullName": "Recipient full name",
    "checkout.fullNamePlaceholder": "Enter recipient name",
    "checkout.email": "Email",
    "checkout.emailPlaceholder": "Enter email",
    "checkout.phone": "Phone number",
    "checkout.phonePlaceholder": "Example: 0978123xxx",
    "checkout.country": "Country",
    "checkout.countryPlaceholder": "Vietnam",
    "checkout.city": "City/Province",
    "checkout.cityPlaceholder": "Select city/province",
    "checkout.district": "District",
    "checkout.districtPlaceholder": "Select district",
    "checkout.ward": "Ward",
    "checkout.wardPlaceholder": "Select ward",
    "checkout.addressLine": "Street address",
    "checkout.addressLinePlaceholder": "Enter street address",
    "checkout.shippingMethod": "Shipping method",
    "checkout.shippingNote": "Please complete your shipping address first.",
    "checkout.paymentMethod": "Payment method",
    "checkout.paymentMomo": "MoMo wallet",
    "checkout.paymentVnpay": "VNPAY",
    "checkout.paymentCod": "Cash on delivery (COD)",
    "checkout.voucherTitle": "Promo code / Gift card",
    "checkout.voucherPlaceholder": "Enter promo code",
    "checkout.voucherApply": "Apply",
    "checkout.voucherRemove": "Remove",
    "checkout.voucherPick": "Choose promotion",
    "checkout.voucherApplied": "Applied",
    "checkout.voucherExpires": "expires",
    "checkout.voucherGuide": "How to use Gift Card",
    "checkout.voucherEmpty": "Please enter a promo code",
    "checkout.voucherLogin": "Please login to apply the code",
    "checkout.voucherAppliedToast": "Promo code applied",
    "checkout.voucherInvalid": "Invalid code",
    "checkout.voucherFailed": "Unable to apply code",
    "checkout.otherInfo": "Other information",
    "checkout.invoice": "Request VAT invoice",
    "checkout.notePlaceholder": "Note",
    "checkout.invoiceNote":
      "Note: Invoices are issued only for orders with complete and accurate information.",
    "checkout.orderReview": "Order review",
    "checkout.subtotal": "Subtotal",
    "checkout.discount": "Discount",
    "checkout.total": "Total",
    "checkout.shippingFee": "Shipping fee",
    "checkout.shippingFeeFree": "$0",
    "checkout.totalWithVat": "Total (incl. VAT)",
    "checkout.confirmPayment": "Confirm payment",
    "checkout.termsNote":
      "By placing your order, you agree to bookStore terms & conditions.",
    "checkout.placeOrder": "Place order",
    "checkout.emptyCart": "Your cart is empty",
    "checkout.loginRequired": "Please login to checkout",
    "checkout.placeSuccess": "Order placed successfully",
    "checkout.placeFailed": "Order failed",

    "orders.title": "My orders",
    "orders.subtitle": "Track status and cancel unpaid orders.",
    "orders.reload": "Reload",
    "orders.loading": "Loading...",
    "orders.empty": "You have no orders yet.",
    "orders.code": "Order code",
    "orders.address": "Address",
    "orders.details": "View order items",
    "orders.cancel": "Cancel order",
    "orders.cancelTitle": "Confirm cancellation",
    "orders.cancelQuestion": "Are you sure you want to cancel this order?",
    "orders.back": "Back",
    "orders.confirmCancel": "Confirm cancel",
    "orders.cancelSuccess": "Order cancelled",
    "orders.cancelFailed": "Cancel failed",
    "orders.loadFailed": "Unable to load",
    "orders.status.paid": "Paid",
    "orders.status.cancelled": "Cancelled",
    "orders.status.placed": "Placed",
    "orders.payment.paid": "Paid",
    "orders.payment.pending": "Processing",
    "orders.payment.failed": "Failed",
    "orders.payment.unpaid": "Unpaid",

    "payment.successTitle": "Payment successful",
    "payment.successDesc":
      "Your order has been received. Thank you for your purchase!",
    "payment.failedTitle": "Payment failed",
    "payment.failedDesc":
      "The transaction failed or was cancelled. Please try again.",
    "payment.missingOrder": "Missing order code for verification",
    "payment.failedToast": "Payment failed",
    "payment.notVerified": "Payment not verified",
    "payment.verifyFailed": "Unable to verify payment",
    "payment.verifying": "Verifying transaction...",
    "payment.orderCode": "Order code",
    "payment.reason": "Error code",
    "payment.viewOrders": "View orders",
    "payment.backToCheckout": "Back to checkout",
    "payment.backHome": "Back to home",
    "payment.badgeSuccess": "SUCCESS",
    "payment.badgeFailed": "FAILED",

    "auth.googleLoadFailed": "Unable to load Google login",
    "auth.forgot": "Forgot password?",
    "auth.forgotTitle": "Forgot password",
    "auth.forgotDesc": "Enter your email to receive a reset link.",
    "auth.forgotEmailPlaceholder": "Enter email",
    "auth.forgotSend": "Send link",
    "auth.cancel": "Cancel",
    "auth.forgotEmailRequired": "Please enter your email",
    "auth.forgotResetLink": "Reset link (dev): ",
    "auth.forgotSent": "If the email exists, a reset link will be sent",
    "auth.forgotFailed": "Unable to submit request",

    "reset.title": "Reset password",
    "reset.subtitle": "Enter a new password for your account.",
    "reset.newPassword": "New password",
    "reset.newPasswordPlaceholder":
      "At least 8 characters with letters and numbers",
    "reset.confirmPassword": "Confirm password",
    "reset.confirmPasswordPlaceholder": "Re-enter your password",
    "reset.submit": "Update password",
    "reset.submitting": "Processing...",
    "reset.missingToken": "Missing reset token",
    "reset.weakPassword":
      "Password must be at least 8 characters with letters and numbers",
    "reset.mismatch": "Passwords do not match",
    "reset.success": "Password reset successfully",
    "reset.failed": "Reset failed",

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
    "auth.login.or": "Or",
    "auth.login.google": "Continue with Google",
    "auth.login.googleNotConfigured": "Google login is not configured",
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
