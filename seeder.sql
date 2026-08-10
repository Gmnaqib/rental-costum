-- Seeders Users
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Administrator System', 'admin@rental.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
(2, 'Budi Santoso', 'budi@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Seeders Profiles
INSERT INTO profiles (user_id, phone_number, address, height_cm, weight_kg, chest_size_cm, waist_size_cm) VALUES
(1, '081234567890', 'Kantor Pusat Rental Kostum', 170, 65, 95, 80),
(2, '089876543210', 'Jl. Mawar No. 12, Bandung', 175, 70, 98, 82);

-- Seeders Units
INSERT INTO units (id, code, name, size_category, recommended_height_min, recommended_height_max, description, status) VALUES
(1, 'KST-NR-001', 'Kostum Naruto Sage Mode', 'L', 170, 180, 'Bahan lembut, termasuk jubah & aksesoris', 'available'),
(2, 'KST-NR-002', 'Kostum Naruto Sage Mode', 'XL', 178, 188, 'Lengkap dengan jubah, wig, dan celana', 'available'),
(3, 'KST-SP-001', 'Kostum Spider-Man Cosplay', 'M', 160, 172, 'Bahan elastis, full costume', 'available');

-- Seeders Events
INSERT INTO events (id, title, location, start_date, end_date, description) VALUES
(1, 'Comic Frontier 19 (Comifuro)', 'ICE BSD, Tangerang', '2026-09-18', '2026-09-20', 'Festival komik dan pop culture terbesar'),
(2, 'Bandung Wibu Festival', 'Braga City Walk, Bandung', '2026-10-02', '2026-10-03', 'Gathering cosplayer regional Bandung');