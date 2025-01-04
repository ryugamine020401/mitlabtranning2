from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR(36) NOT NULL UNIQUE,
    "user_uid" VARCHAR(36) NOT NULL  PRIMARY KEY,
    "username" VARCHAR(30) NOT NULL UNIQUE,
    "email" VARCHAR(320) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "created_at" VARCHAR(25) NOT NULL,
    "updated_at" VARCHAR(36) NOT NULL
);
COMMENT ON TABLE "users" IS 'User 的資料庫節定義';
CREATE TABLE IF NOT EXISTS "profiles" (
    "name" VARCHAR(50),
    "phone_number" VARCHAR(15),
    "date_of_birth" VARCHAR(10),
    "address" VARCHAR(255),
    "profile_picture_url" VARCHAR(255),
    "bio" VARCHAR(500),
    "f_user_uid_id" VARCHAR(36) NOT NULL REFERENCES "users" ("user_uid") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_profiles_f_user__23d296" ON "profiles" ("f_user_uid_id");
COMMENT ON TABLE "profiles" IS 'Profiles 的資料庫結構定義';
CREATE TABLE IF NOT EXISTS "lists" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "list_uid" VARCHAR(36) NOT NULL,
    "list_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" VARCHAR(25) NOT NULL,
    "f_user_id_id" VARCHAR(36) NOT NULL REFERENCES "users" ("user_uid") ON DELETE CASCADE,
    CONSTRAINT "uid_lists_f_user__e8cc15" UNIQUE ("f_user_id_id", "list_uid")
);
COMMENT ON TABLE "lists" IS 'Lists 的資料庫結構定義';
CREATE TABLE IF NOT EXISTS "products" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "product_name" VARCHAR(100) NOT NULL,
    "product_barcode" VARCHAR(13) NOT NULL,
    "product_number" VARCHAR(36) NOT NULL  DEFAULT '1',
    "product_image_url" VARCHAR(255) NOT NULL,
    "expiry_date" VARCHAR(10) NOT NULL,
    "description" VARCHAR(255),
    "f_list_id_id" INT NOT NULL REFERENCES "lists" ("id") ON DELETE CASCADE,
    "f_user_id_id" VARCHAR(36) NOT NULL REFERENCES "users" ("user_uid") ON DELETE CASCADE,
    CONSTRAINT "uid_products_f_user__c91df9" UNIQUE ("f_user_id_id", "f_list_id_id", "product_barcode", "expiry_date")
);
COMMENT ON TABLE "products" IS '產品內容';
CREATE TABLE IF NOT EXISTS "list_permissions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "granted_at" VARCHAR(36) NOT NULL,
    "f_list_id_id" INT NOT NULL REFERENCES "lists" ("id") ON DELETE CASCADE,
    "f_owner_id_id" VARCHAR(36) NOT NULL REFERENCES "users" ("user_uid") ON DELETE CASCADE,
    "f_viewer_id_id" VARCHAR(36) NOT NULL REFERENCES "users" ("user_uid") ON DELETE CASCADE,
    CONSTRAINT "uid_list_permis_f_owner_b191c1" UNIQUE ("f_owner_id_id", "f_viewer_id_id", "f_list_id_id")
);
COMMENT ON TABLE "list_permissions" IS '閱覽清單的權限';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
