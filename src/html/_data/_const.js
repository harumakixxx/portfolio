// jsやcssのキャッシュ対策に使う文字
const VERSION = Math.floor(Math.random() * 1000000);
const SITE_OGP_BASE_URL = 'https://example.com';
const SITE_OGP_IMAGE_URL = SITE_OGP_BASE_URL + '/img/ogp.jpg';
const SITE_TITLE = 'サイト名';
// 中略

// 書き出し用にまとめる
module.exports = {
    VERSION,
    SITE_OGP_BASE_URL,
    SITE_OGP_IMAGE_URL,
    SITE_TITLE,
    // 中略
};