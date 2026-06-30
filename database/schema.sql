-- ============================================================
-- SUMAN BEAUTY & FASHION E-COMMERCE - DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS suman_ecommerce;
USE suman_ecommerce;

-- ========================
-- USERS TABLE
-- ========================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(15),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    provider ENUM('LOCAL', 'GOOGLE') DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- CATEGORIES TABLE
-- ========================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    parent_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ========================
-- BRANDS TABLE
-- ========================
CREATE TABLE brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- PRODUCTS TABLE
-- ========================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0,
    category_id BIGINT,
    brand_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    tags VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- ========================
-- PRODUCT IMAGES
-- ========================
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- PRODUCT VARIANTS
-- ========================
CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    color_hex VARCHAR(10),
    shade VARCHAR(100),
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- ADDRESSES
-- ========================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    address_type ENUM('HOME', 'WORK', 'OTHER') DEFAULT 'HOME',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================
-- COUPONS
-- ========================
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    user_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATETIME,
    valid_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- ORDERS
-- ========================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    address_id BIGINT,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_id BIGINT,
    shipping_charge DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('COD', 'ONLINE', 'WALLET') DEFAULT 'COD',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    order_status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT,
    notes TEXT,
    invoice_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
);

-- ========================
-- ORDER ITEMS
-- ========================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- ========================
-- ORDER TRACKING
-- ========================
CREATE TABLE order_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED') NOT NULL,
    message TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ========================
-- CART
-- ========================
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- ========================
-- WISHLIST
-- ========================
CREATE TABLE wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- REVIEWS
-- ========================
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_item_id BIGINT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    images VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL
);

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ORDER', 'OFFER', 'SYSTEM', 'REVIEW', 'PAYMENT') DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================
-- SEARCH ANALYTICS
-- ========================
CREATE TABLE search_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    search_term VARCHAR(255) NOT NULL,
    result_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================
-- RECENTLY VIEWED
-- ========================
CREATE TABLE recently_viewed (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_viewed (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- USER BEHAVIOR (AI)
-- ========================
CREATE TABLE user_behavior (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    action ENUM('VIEW', 'CART', 'WISHLIST', 'PURCHASE', 'REVIEW') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- SEED DATA
-- ========================

-- Admin user (password: Akshay@123)
INSERT INTO users (name, email, password, role, is_active, email_verified) VALUES
('Akshay Pratap Singh', 'ashusingh41537@gmail.com', '$2a$12$ZyngXPqP.G3cZnu1J10KDuQzA4rumZX2oTadSfnBc/zSI9XtRIwSW', 'ADMIN', TRUE, TRUE),

-- Categories
INSERT INTO categories (name, slug, description, image) VALUES
('Makeup', 'makeup', 'Foundation, Lipstick, Kajal & more', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'),
('Skincare', 'skincare', 'Moisturizers, Serums, SPF & more', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),
('Bags', 'bags', 'Handbags, Clutches, Backpacks', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Shoes', 'shoes', 'Heels, Flats, Sneakers & more', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Clothing', 'clothing', 'Kurtas, Dresses, Tops & more', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
('Haircare', 'haircare', 'Shampoo, Conditioner, Hair Oils', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'),
('Fragrance', 'fragrance', 'Perfumes & Body Mists', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400');

-- Brands
INSERT INTO brands (name, slug, description) VALUES
('Lakme', 'lakme', 'India''s leading beauty brand'),
('MAC', 'mac', 'Professional makeup worldwide'),
('L''Oreal', 'loreal', 'Premium beauty products'),
('Nykaa', 'nykaa', 'India''s beauty destination'),
('Forest Essentials', 'forest-essentials', 'Luxury Ayurvedic skincare'),
('Sugar Cosmetics', 'sugar-cosmetics', 'Bold and long-lasting makeup'),
('Mamaearth', 'mamaearth', 'Natural and safe products'),
('Wow Skin Science', 'wow-skin-science', 'Science-backed beauty');

-- Products
INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, brand_id, is_featured, is_trending, average_rating, review_count, sold_count, tags) VALUES
('Lakme 9to5 Primer + Matte Lipstick', 'lakme-9to5-matte-lipstick', 'Long lasting matte finish lipstick with primer formula. Provides 16hrs wear. Available in 30+ shades.', 'Primer + Matte lipstick, 16hrs wear', 299.00, 450.00, 'LKM-LIP-001', 150, 1, 1, TRUE, TRUE, 4.3, 245, 890, 'lipstick,matte,lakme,makeup'),
('MAC Ruby Woo Lipstick', 'mac-ruby-woo-lipstick', 'The iconic MAC Ruby Woo - a vivid blue-red with a retro matte finish. Highly pigmented, long-lasting formula.', 'Iconic red matte lipstick', 1850.00, 2200.00, 'MAC-LIP-001', 80, 1, 2, TRUE, FALSE, 4.7, 520, 1200, 'lipstick,red,mac,luxury'),
('Lakme Absolute Skin Natural Mousse', 'lakme-skin-mousse', 'Lightweight foundation with mousse texture. SPF 8 protection. Full coverage for all skin types.', 'Lightweight foundation SPF8', 499.00, 699.00, 'LKM-FND-001', 200, 1, 1, FALSE, TRUE, 4.1, 189, 450, 'foundation,lakme,makeup,coverage'),
('Mamaearth Vitamin C Face Serum', 'mamaearth-vitamin-c-serum', 'Vitamin C serum with turmeric for glowing skin. Reduces dark spots, evens skin tone. Dermatologist tested.', 'Glow serum with Vitamin C & Turmeric', 599.00, 799.00, 'MME-SRM-001', 300, 2, 7, TRUE, TRUE, 4.5, 890, 2100, 'serum,vitamin-c,skincare,glow'),
('Wow Apple Cider Vinegar Face Wash', 'wow-acv-face-wash', 'Deep cleansing face wash with Apple Cider Vinegar. Controls oil, minimizes pores. No parabens, no sulfates.', 'ACV face wash for clear skin', 349.00, 499.00, 'WOW-FW-001', 250, 2, 8, FALSE, TRUE, 4.2, 560, 1300, 'facewash,acv,skincare,cleanser'),
('Forest Essentials Kumkumadi Oil', 'forest-essentials-kumkumadi', 'Luxury Ayurvedic brightening face oil. Reduces pigmentation, improves skin texture. Pure gold & saffron.', 'Luxury Ayurvedic brightening oil', 2495.00, 2800.00, 'FE-OIL-001', 50, 2, 5, TRUE, FALSE, 4.8, 320, 890, 'oil,luxury,ayurvedic,skincare,glow'),
('Zara Mini Bucket Bag', 'zara-mini-bucket-bag', 'Trendy mini bucket bag in genuine leather. Multiple compartments, detachable strap. Perfect for everyday use.', 'Stylish mini bucket bag', 2999.00, 4500.00, 'ZRA-BAG-001', 45, 3, 4, TRUE, TRUE, 4.4, 123, 340, 'bag,bucket,leather,accessories'),
('Aldo Strappy Heels', 'aldo-strappy-heels', 'Elegant strappy block heels 3 inch. Padded insole for comfort. Available in black, nude, red.', 'Comfortable strappy block heels', 3499.00, 5000.00, 'ALD-SHO-001', 60, 4, 4, TRUE, FALSE, 4.2, 89, 210, 'heels,shoes,strappy,fashion'),
('Biba Floral Kurta Set', 'biba-floral-kurta', 'Beautiful cotton floral print kurta with palazzo pants. Festive wear, machine washable.', 'Floral cotton kurta palazzo set', 1499.00, 2200.00, 'BIB-KRT-001', 100, 5, 4, FALSE, TRUE, 4.3, 234, 560, 'kurta,ethnic,cotton,fashion'),
('L''Oreal Paris Hair Mask', 'loreal-hair-mask', 'Extraordinary Oil hair mask with 8 precious oils. Repairs damaged hair, adds shine. For all hair types.', 'Deep repair hair mask with 8 oils', 449.00, 699.00, 'LOR-HM-001', 180, 6, 3, FALSE, FALSE, 4.0, 145, 380, 'haircare,mask,loreal,repair'),
('Sugar Cosmetics Contour Palette', 'sugar-contour-palette', 'All-in-one contour, highlight and blush palette. Matte and shimmer shades. Long wearing formula.', 'Contour, highlight & blush palette', 799.00, 1200.00, 'SGR-PAL-001', 120, 1, 6, TRUE, TRUE, 4.5, 345, 780, 'contour,palette,makeup,sugar'),
('Nykaa Skin Fit Foundation', 'nykaa-skin-fit-foundation', 'Buildable coverage foundation with SPF 30. Blurs pores, 24hr wear. 30 shades for Indian skin tones.', 'SPF30 foundation for Indian skin', 799.00, 1100.00, 'NYK-FND-001', 200, 1, 4, TRUE, FALSE, 4.3, 430, 950, 'foundation,nykaa,spf,makeup');

-- Product Images
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1586495777744-4e6232bf2e27?w=600', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', FALSE, 2),
(5, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', FALSE, 2),
(8, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', TRUE, 1),
(11, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', TRUE, 1),
(12, 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600', TRUE, 1);

-- Product Variants
INSERT INTO product_variants (product_id, color, color_hex, shade, additional_price, stock_quantity) VALUES
(1, 'Red', '#FF0000', 'Cherry Red', 0, 50),
(1, 'Pink', '#FF69B4', 'Rose Pink', 0, 40),
(1, 'Nude', '#E8C4A0', 'Beige Nude', 0, 60),
(2, 'Red', '#CC0000', 'Ruby Woo', 0, 80),
(8, NULL, NULL, NULL, 0, 20),
(8, NULL, NULL, NULL, 200, 20),
(9, NULL, NULL, NULL, 0, 30);

-- Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, valid_until) VALUES
('WELCOME10', 'Welcome offer - 10% off on first order', 'PERCENTAGE', 10.00, 500.00, 200.00, 1000, TRUE, '2025-12-31'),
('SUMAN20', 'Suman exclusive - flat 20% off', 'PERCENTAGE', 20.00, 1000.00, 500.00, 500, TRUE, '2025-12-31'),
('FLAT200', 'Flat ₹200 off on orders above ₹1500', 'FIXED', 200.00, 1500.00, NULL, 300, TRUE, '2025-12-31'),
('BEAUTY50', 'Beauty essentials - ₹50 off', 'FIXED', 50.00, 299.00, NULL, NULL, TRUE, '2025-12-31'),
('NEWUSER', 'New user special - 15% off', 'PERCENTAGE', 15.00, 0.00, 300.00, 2000, TRUE, '2025-12-31');

-- Sample Reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
(1, 2, 5, 'Amazing lipstick!', 'Love the matte finish, stays all day long. Cherry Red shade is gorgeous!', TRUE, TRUE),
(1, 3, 4, 'Good product', 'Nice color payoff and long lasting. Slightly drying but manageable.', FALSE, TRUE),
(4, 2, 5, 'Best serum ever!', 'My skin has visibly glowed after 2 weeks. Dark spots reduced significantly!', TRUE, TRUE),
(7, 3, 4, 'Cute bag!', 'Quality is great and looks exactly like the photos. Delivery was fast.', TRUE, TRUE);

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(average_rating);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_search_term ON search_history(search_term);
CREATE FULLTEXT INDEX idx_product_search ON products(name, description, tags);

SELECT 'Database schema created successfully!' AS status;

