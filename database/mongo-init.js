/**
 * First-boot init for official `mongo` image (docker-entrypoint-initdb.d).
 * Credentials must match `docker/docker-compose.yml` (change both for production).
 */
const DB = "authentick";
const APP_USER = "authentick";
const APP_PWD = "authentick_dev_password";

db = db.getSiblingDB(DB);

db.createUser({
  user: APP_USER,
  pwd: APP_PWD,
  roles: [{ role: "readWrite", db: DB }],
});

db.products.createIndex({ tokenId: 1 }, { unique: true });
db.products.createIndex({ gtin: 1, serial: 1 }, { unique: true });
db.epcisevents.createIndex({ productId: 1, eventTime: 1 });
db.users.createIndex({ address: 1 }, { unique: true });
