/* スマートWEB - Google Analytics 4 共通読み込み
   ▼▼▼ 下の1行の G-XXXXXXXXXX を、GA4の測定IDに書き換えてください ▼▼▼ */
var GA_MEASUREMENT_ID = 'G-5N9MJ1Z3EJ';

(function () {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return; // 未設定なら何もしない
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
})();
