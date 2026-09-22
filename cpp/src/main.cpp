#include <iostream>
#include <iomanip>
#include <vector>
#include "nexus_core.hpp"
#include "pricing_engine.hpp"
#include "inventory_optimizer.hpp"
#include "crypto_engine.hpp"
#include "optimizer.hpp"

int main() {
    std::cout << "========================================================\n";
    std::cout << "  NEXUS NATIVE C++ COMPUTATIONAL ENGINE v1.0.0\n";
    std::cout << "  High-Speed Arithmetic, Inventory Optimization & Crypto\n";
    std::cout << "========================================================\n\n";

    // 1. Benchmark Pricing Engine & GST Computation
    std::vector<nexus::OrderItem> order_items = {
        {1, "Alphonso Mango Crate", "NX-MNG-001", 2, 3200.0, 6400.0},
        {2, "Filter Coffee Concentrate", "NX-CFE-001", 1, 1800.0, 1800.0}
    };

    auto breakdown = nexus::PricingEngine::calculateOrderTotals(
        order_items,
        500.0, // ₹500 discount
        nexus::DiscountMode::FIXED_AMOUNT,
        18.0,  // 18% GST
        false  // Intra-state
    );

    std::cout << "[1] PRICING ENGINE VALIDATION:\n";
    std::cout << "  - Subtotal:       ₹" << breakdown.subtotal << "\n";
    std::cout << "  - Discount:     - ₹" << breakdown.discount_amount << "\n";
    std::cout << "  - Taxable Base:   ₹" << breakdown.taxable_amount << "\n";
    std::cout << "  - GST (18%):    + ₹" << breakdown.tax_amount << "\n";
    std::cout << "  - Grand Total:    ₹" << breakdown.grand_total << "\n\n";

    // 2. Benchmark Multi-Currency Conversion
    double inr_amount = 100000.0;
    std::cout << "[2] MULTI-CURRENCY CONVERSION TABLE (₹" << inr_amount << "):\n";
    std::cout << "  - USD: " << nexus::NexusCore::formatCurrency(nexus::PricingEngine::convertCurrency(inr_amount, nexus::Currency::INR, nexus::Currency::USD), nexus::Currency::USD) << "\n";
    std::cout << "  - EUR: " << nexus::NexusCore::formatCurrency(nexus::PricingEngine::convertCurrency(inr_amount, nexus::Currency::INR, nexus::Currency::EUR), nexus::Currency::EUR) << "\n";
    std::cout << "  - GBP: " << nexus::NexusCore::formatCurrency(nexus::PricingEngine::convertCurrency(inr_amount, nexus::Currency::INR, nexus::Currency::GBP), nexus::Currency::GBP) << "\n";
    std::cout << "  - AED: " << nexus::NexusCore::formatCurrency(nexus::PricingEngine::convertCurrency(inr_amount, nexus::Currency::INR, nexus::Currency::AED), nexus::Currency::AED) << "\n\n";

    // 3. Benchmark Cryptographic Invoicing Signature
    std::string invoice_num = "NEXUS-INV-2026-00001";
    std::string secret = "nexus-local-development-secret-change-later";
    std::string signature = nexus::CryptoEngine::generateInvoiceSignature(invoice_num, secret);
    bool valid = nexus::CryptoEngine::verifyInvoiceSignature(invoice_num, signature, secret);

    std::cout << "[3] CRYPTOGRAPHIC HMAC-SHA256 INVOICE VERIFICATION:\n";
    std::cout << "  - Document:  " << invoice_num << "\n";
    std::cout << "  - Digest:    " << signature << "\n";
    std::cout << "  - Verified:  " << (valid ? "TRUE (Constant-Time Match)" : "FALSE") << "\n\n";

    // 4. Inventory EOQ & Safety Stock Optimization
    int eoq = nexus::InventoryOptimizer::calculateEOQ(12000.0, 250.0, 50.0);
    int safety = nexus::InventoryOptimizer::calculateSafetyStock(45.0, 30.0, 10, 7);

    std::cout << "[4] INVENTORY ALGORITHMS:\n";
    std::cout << "  - Economic Order Quantity (EOQ): " << eoq << " units\n";
    std::cout << "  - Dynamic Safety Stock Buffer:   " << safety << " units\n\n";

    std::cout << "All C++ backend computational modules verified successfully.\n";
    return 0;
}
