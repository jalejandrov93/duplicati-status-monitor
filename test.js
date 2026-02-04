const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.ltsmcluster.j10vv95.mongodb.net",
  (err, records) => {
    if (err) {
      console.error("❌ DNS FAIL:", err);
    } else {
      console.log("✅ DNS OK:", records);
    }
  }
);
