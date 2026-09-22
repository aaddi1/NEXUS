#pragma once

#include "nexus_core.hpp"
#include <vector>
#include <string>

namespace nexus {

enum class DiscountMode {
    FIXED_AMOUNT,
    PERCENTAGE
};

struct TaxDetail {
    double cgst_rate;
    double cgst_amount;
    double sgst_rate;
    double sgst_amount;
    double igst_rate;
    double igst_amount;
    bool is_interstate;
};

class PricingEngine {
public:
    static FinancialBreakdown calculateOrderTotals(
        const std::vector<OrderItem>& items,
        double discount_value,
        DiscountMode discount_mode,
        double tax_rate_percent,
        bool is_interstate = false
    );

    static TaxDetail computeGstBreakdown(
        double taxable_amount,
        double gst_rate_percent,
        bool is_interstate = false
    );

    static double convertCurrency(
        double amount,
        Currency from,
        Currency to
    );
};

} // namespace nexus
