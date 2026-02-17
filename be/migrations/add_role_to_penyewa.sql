-- Migration: Add role field to penyewa table
-- Purpose: Differentiate between guest users (registered) and tenant users (active residents)
-- Date: 2026-02-17

-- Add role column with default value 'guest'
ALTER TABLE penyewa 
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'guest';

-- Add comment to explain the role field
COMMENT ON COLUMN penyewa.role IS 'User role: guest (registered but not booked), tenant (active resident), former_tenant (past resident)';

-- Update existing records to 'tenant' if they have confirmed bookings
UPDATE penyewa p
SET role = 'tenant'
WHERE EXISTS (
    SELECT 1 
    FROM pemesanan pe
    JOIN pembayaran pb ON pb.pemesanan_id = pe.id
    WHERE pe.penyewa_id = p.id 
    AND pb.status_pembayaran = 'Confirmed'
);

-- Create index for faster role-based queries
CREATE INDEX idx_penyewa_role ON penyewa(role);
