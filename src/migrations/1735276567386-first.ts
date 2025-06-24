import { MigrationInterface, QueryRunner } from "typeorm";

export class First1735276567386 implements MigrationInterface {
    name = 'First1735276567386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "postalCode" character varying(10) NOT NULL, "addressStreet" character varying(30) NOT NULL, "addressNumber" character varying(10) NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "identification_type" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, CONSTRAINT "UQ_1bddbdc00ecfb061c6b81a3cc8e" UNIQUE ("name"), CONSTRAINT "PK_2c5e774af32b420dafcc7bb3aab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_method_enum" AS ENUM('LOCAL', 'GOOGLE')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "surname" character varying NOT NULL, "username" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "phone" character varying(20) NOT NULL, "idNumber" character varying NOT NULL, "email" character varying NOT NULL, "method" "public"."user_method_enum" NOT NULL DEFAULT 'LOCAL', "password" character varying, "passwordResetToken" character varying, "passwordResetTokenExpiresIn" TIMESTAMP, "idTypeId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_type" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "UQ_8978484a9cee7a0c780cd259b88" UNIQUE ("name"), CONSTRAINT "PK_e0843930fbb8854fe36ca39dae1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_image" ("id" SERIAL NOT NULL, "url" text NOT NULL, "productId" integer, CONSTRAINT "PK_99d98a80f57857d51b5f63c8240" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "price" numeric(10,2) NOT NULL, "cost" numeric(10,2) NOT NULL, "name" character varying NOT NULL, "stock" integer NOT NULL DEFAULT '0', "description" text NOT NULL, "image" text NOT NULL, "typeId" integer, "brandId" integer, "supplierId" integer, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "paymentId" character varying NOT NULL, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "paymentMethod" character varying NOT NULL DEFAULT 'MP_TRANSFER', "netPrice" numeric(10,2) NOT NULL, "IVA" numeric(10,2) NOT NULL DEFAULT '0.21', "total" numeric(10,2) NOT NULL, "profit" numeric(10,2) NOT NULL, "addressId" integer, "userId" integer, CONSTRAINT "UQ_9ad13532f48db4ac5a3b3dd70e5" UNIQUE ("paymentId"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product-order" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "orderId" integer, "productId" integer, CONSTRAINT "PK_f9c2fa606532cf6c560d43fa9ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_address_address" ("userId" integer NOT NULL, "addressId" integer NOT NULL, CONSTRAINT "PK_33c1cc93f3f8ffbd67c93d7a847" PRIMARY KEY ("userId", "addressId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3641446351e94089ba80de503" ON "user_address_address" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c3ca130325607a626583e7e9c4" ON "user_address_address" ("addressId") `);
        await queryRunner.query(`CREATE TABLE "user_roles_roles" ("userId" integer NOT NULL, "rolesId" integer NOT NULL, CONSTRAINT "PK_af39506d4797d25dbf41b29ea91" PRIMARY KEY ("userId", "rolesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0d0cc409255467b0ac4fe6b169" ON "user_roles_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7521d8491e7c51f885e9f861e0" ON "user_roles_roles" ("rolesId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_8fab721793695eec4a7d65f8c00" FOREIGN KEY ("idTypeId") REFERENCES "identification_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_image" ADD CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_53bafe3ecc25867776c07c9e666" FOREIGN KEY ("typeId") REFERENCES "product_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_73f9a47e41912876446d047d015" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product-order" ADD CONSTRAINT "FK_69082506ca875b517d210b1efbb" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product-order" ADD CONSTRAINT "FK_8df7afab455fc84fee7c9fd0a47" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_address_address" ADD CONSTRAINT "FK_b3641446351e94089ba80de5034" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_address_address" ADD CONSTRAINT "FK_c3ca130325607a626583e7e9c41" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" ADD CONSTRAINT "FK_0d0cc409255467b0ac4fe6b1693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" ADD CONSTRAINT "FK_7521d8491e7c51f885e9f861e02" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    
        // INSERTS
        
        // MARCAS
        await queryRunner.query(`insert into brand (name) values ('ADIDAS'),('BABOLAT'),('BULLPADEL'),('NOX'),('SIUX'),('ROYAL'),('COAST'),('TOP FORCE'),('BLACK CROWN'),('FELINA PADEL'),('HEAD')`);
        
        // // PROVEDORES
        await queryRunner.query(`insert into supplier (name) values ('Gonza'), ('SC Group Gus'), ('Maxi Fernandez')`);

        // // TIPO DE PRODUCTO
        await queryRunner.query(`insert into product_type (name) values ('paleta')`);

        // // PRODUCTOS

        await queryRunner.query(`insert into product (name, price, cost, stock, description, image, "typeId", "brandId", "supplierId") values
        ('ADIDAS ADIPOWER LIGHT 3.2 2023', 280.00, 250.00, 100, 'Esta es la descripcion de la ADIDAS ADIPOWER LIGHT 3.2 2023', 'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw', 1, 1, 1),
        ('BABOLAT AIR VERON 2022', 235.00, 210.00, 100, 'Esta es la descripcion de la BABOLAT AIR VERON 2022', 'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw', 1, 2, 1),
        ('BULLPADEL FLOW LIGHT 2022', 120.00, 100.00, 100, 'Esta es la descripcion de la BULLPADEL FLOW LIGHT 2022', 'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw', 1, 3, 1),
        ('PITON 11', 282.00, 200.00, 100, 'Esta es la descripcion de la PITON 11', 'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw', 1, 9, 2),
        ('METALBONE 3.3 HRD', 490.00, 450.00, 100, 'Esta es la descripcion de la METALBONE 3.3 HRD', 'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw', 1, 1, 3)`);

        // // IMAGENES SECUNDARIAS

        await queryRunner.query(`insert into product_image (url, "productId") values
        ('https://drive.google.com/thumbnail?id=1I5RSU6MD7uCmGwE4yHz3SzLmuDQXGvq6', 1),
        ('https://drive.google.com/thumbnail?id=13SUucDb_wE69epj5OjTXkdj2-GbHCIq5', 1),
        ('https://drive.google.com/thumbnail?id=1wekHtMwrQyPn3JsGjHlPbaVhm885C-K6', 1),
        ('https://drive.google.com/thumbnail?id=1I5RSU6MD7uCmGwE4yHz3SzLmuDQXGvq6', 2),
        ('https://drive.google.com/thumbnail?id=13SUucDb_wE69epj5OjTXkdj2-GbHCIq5', 2),
        ('https://drive.google.com/thumbnail?id=1wekHtMwrQyPn3JsGjHlPbaVhm885C-K6', 2),
        ('https://drive.google.com/thumbnail?id=1I5RSU6MD7uCmGwE4yHz3SzLmuDQXGvq6', 3),
        ('https://drive.google.com/thumbnail?id=13SUucDb_wE69epj5OjTXkdj2-GbHCIq5', 3),
        ('https://drive.google.com/thumbnail?id=1wekHtMwrQyPn3JsGjHlPbaVhm885C-K6', 3),
        ('https://drive.google.com/thumbnail?id=1I5RSU6MD7uCmGwE4yHz3SzLmuDQXGvq6', 4),
        ('https://drive.google.com/thumbnail?id=13SUucDb_wE69epj5OjTXkdj2-GbHCIq5', 4),
        ('https://drive.google.com/thumbnail?id=1wekHtMwrQyPn3JsGjHlPbaVhm885C-K6', 4),
        ('https://drive.google.com/thumbnail?id=1I5RSU6MD7uCmGwE4yHz3SzLmuDQXGvq6', 5),
        ('https://drive.google.com/thumbnail?id=13SUucDb_wE69epj5OjTXkdj2-GbHCIq5', 5),
        ('https://drive.google.com/thumbnail?id=1wekHtMwrQyPn3JsGjHlPbaVhm885C-K6', 5)`);

        // // TIPO DE USUARIO

        await queryRunner.query(`insert into roles (name) values ('user'), ('admin')`);

        // // TIPOS DE IDENTIFICACION

        await queryRunner.query(`insert into identification_type (name) values ('DNI'), ('CPF'), ('CURP'), ('RUT')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles_roles" DROP CONSTRAINT "FK_7521d8491e7c51f885e9f861e02"`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" DROP CONSTRAINT "FK_0d0cc409255467b0ac4fe6b1693"`);
        await queryRunner.query(`ALTER TABLE "user_address_address" DROP CONSTRAINT "FK_c3ca130325607a626583e7e9c41"`);
        await queryRunner.query(`ALTER TABLE "user_address_address" DROP CONSTRAINT "FK_b3641446351e94089ba80de5034"`);
        await queryRunner.query(`ALTER TABLE "product-order" DROP CONSTRAINT "FK_8df7afab455fc84fee7c9fd0a47"`);
        await queryRunner.query(`ALTER TABLE "product-order" DROP CONSTRAINT "FK_69082506ca875b517d210b1efbb"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_73f9a47e41912876446d047d015"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_53bafe3ecc25867776c07c9e666"`);
        await queryRunner.query(`ALTER TABLE "product_image" DROP CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_8fab721793695eec4a7d65f8c00"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7521d8491e7c51f885e9f861e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d0cc409255467b0ac4fe6b169"`);
        await queryRunner.query(`DROP TABLE "user_roles_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3ca130325607a626583e7e9c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3641446351e94089ba80de503"`);
        await queryRunner.query(`DROP TABLE "user_address_address"`);
        await queryRunner.query(`DROP TABLE "product-order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_image"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TABLE "brand"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_method_enum"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "identification_type"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
