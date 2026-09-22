#include "pricing_engine.hpp"
#include <cmath>
#include <algorithm>

namespace nexus {

FinancialBreakdown PricingEngine::calculateOrderTotals(
    const std::vector<OrderItem>& items,
    double discount_value,
    DiscountMode discount_mode,
    double tax_rate_percent,
    bool is_interstate
) {
    FinancialBreakdown fb;
    fb.subtotal = 0.0;
    fb.currency_symbol = "₹";

    for (const auto& item : items) {
        fb.subtotal += item.unit_price * std::max(1, item.quantity);
    }

    if (discount_mode == DiscountMode::PERCENTAGE) {
        double pct = std::max(0.0, std::min(100.0, discount_value));
        fb.discount_amount = std::round(fb.subtotal * (pct / 100.0) * 100.0) / 100.0;
    } else {
        fb.discount_amount = std::max(0.0, std::min(fb.subtotal, discount_value));
    }

    fb.taxable_amount = std::max(0.0, fb.subtotal - fb.discount_amount);
    fb.tax_rate_percent = std::max(0.0, std::min(100.0, tax_rate_percent));
    fb.tax_amount = std::round(fb.taxable_amount * (fb.tax_rate_percent / 100.0) * 100.0) / 100.0;
    fb.grand_total = std::round((fb.taxable_amount + fb.tax_amount) * 100.0) / 100.0;

    return fb;
}

TaxDetail PricingEngine::computeGstBreakdown(
    double taxable_amount,
    double gst_rate_percent,
    bool is_interstate
) {
    TaxDetail td;
    td.is_interstate = is_interstate;
    double safe_taxable = std::max(0.0, taxable_amount);
    double safe_rate = std::max(0.0, gst_rate_percent);

    if (is_interstate) {
        td.igst_rate = safe_rate;
        td.igst_amount = std::round(safe_taxable * (safe_rate / 100.0) * 100.0) / 100.0;
        td.cgst_rate = 0.0;
        td.cgst_amount = 0.0;
        td.sgst_rate = 0.0;
        td.sgst_amount = 0.0;
    } else {
        td.igst_rate = 0.0;
        td.igst_amount = 0.0;
        td.cgst_rate = safe_rate / 2.0;
        td.cgst_amount = std::round(safe_taxable * (td.cgst_rate / 100.0) * 100.0) / 100.0;
        td.sgst_rate = safe_rate / 2.0;
        td.sgst_amount = std::round(safe_taxable * (td.sgst_rate / 100.0) * 100.0) / 100.0;
    }

    return td;
}

double PricingEngine::convertCurrency(double amount, Currency from, Currency to) {
    if (from == to) return amount;

    // Rates relative to 1 INR
    static const std::map<Currency, double> inr_rates = {
        {Currency::INR, 1.0},
        {Currency::USD, 86.50},
        {Currency::EUR, 91.20},
        {Currency::GBP, 108.40},
        {Currency::AED, 23.55},
        {Currency::JPY, 0.58}
    };

    double from_rate = inr_rates.at(from);
    double to_rate = inr_rates.at(to);

    double amount_in_inr = amount * from_rate;
    double converted = amount_in_inr / to_rate;

    return std::round(converted * 100.0) / 100.0;
}

} // namespace nexus
