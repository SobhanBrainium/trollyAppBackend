module.exports = {
    "port": 2000,
    "secretKey": "hyrgqwjdfbw4534efqrwer2q38945765",
    production: {
        username: 'BeaiwareHealth',
        password: 'AppLive2020',
        host: 'localhost',
        port: '27017',
        dbName: 'BEIWARE',
        authDb: 'admin'
    },
    
    local: {
        database: "mongodb://localhost:27017/trolly",
        MAIL_USERNAME: "ipsita.brainium@gmail.com",
        MAIL_PASS: "gjhubtlvqzvnvidr"
    },
    twilio: {
        ACCOUNT_SID: '', //test acc
        AUTH_TOKEN: '',
        FROM_NO: ''
    },
    siteConfig: {
        LOGO: '#',
        SITECOLOR: '#0095B0',
        SITENAME: 'Beaiware Health'
    },
    uploadContentPath: "public/uploads/content/",
    contentPath: "uploads/content/",
    uploadCsvPath: "public/uploads/csv/",
    csvPath: "uploads/csv/",
    rootPath : "/var/www/html/api-service/",
    liveUrl: "http://3.132.72.42/:1930/",
    adminUrl: "http://3.132.72.42/admin/",
    logPath: "/ServiceLogs/admin.debug.log",
    deeplink: "tipi://",
    dev_mode: true,
    __root_dir: __dirname,
    __site_url: '',
    limit: 10,
    adminEmailAddress:'ipsita12.amstech@gmail.com',
    beaconTimeDiff: '600000'

}