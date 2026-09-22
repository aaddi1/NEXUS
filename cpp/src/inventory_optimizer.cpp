#include "inventory_optimizer.hpp"
#include <cmath>
#include <algorithm>

namespace nexus {

int InventoryOptimizer::calculateEOQ(
    double annual_demand,
    double order_cost,
    double holding_cost_per_unit
) {
    if (annual_demand <= 0.0 || order_cost <= 0.0 || holding_cost_per_unit <= 0.0) {
        return 0;
    }
    double eoq = std::sqrt((2.0 * annual_demand * order_cost) / holding_cost_per_unit);
    return static_cast<int>(std::round(eoq));
}

int InventoryOptimizer::calculateSafetyStock(
    double max_daily_sales,
    double avg_daily_sales,
    int max_lead_time_days,
    int avg_lead_time_days
) {
    double term1 = max_daily_sales * static_cast<double>(max_lead_time_days);
    double term2 = avg_daily_sales * static_cast<double>(avg_lead_time_days);
    double safety = std::max(0.0, term1 - term2);
    return static_cast<int>(std::ceil(safety));
}

std::vector<ReorderRecommendation> InventoryOptimizer::evaluateReorders(
    const std::vector<WarehouseStock>& inventory_snapshot,
    const std::map<int, double>& product_daily_demand
) {
    std::vector<ReorderRecommendation> recs;
    recs.reserve(inventory_snapshot.size());

    for (const auto& item : inventory_snapshot) {
        ReorderRecommendation rec;
        rec.product_id = item.product_id;
        rec.sku = item.sku;
        rec.current_stock = item.available;
        rec.lead_time_days = 7; // Default 7-day replenishment lead time

        double daily_burn = 0.0;
        auto it = product_daily_demand.find(item.product_id);
        if (it != product_daily_demand.end()) {
            daily_burn = it->second;
        }
        rec.daily_burn_rate = static_cast<int>(std::ceil(daily_burn));

        double lead_time_demand = daily_burn * static_cast<double>(rec.lead_time_days);
        double buffer = lead_time_demand * 0.20; // 20% safety margin
        double target_level = lead_time_demand + buffer;

        if (item.available <= 0) {
            rec.urgency_level = "CRITICAL";
            rec.recommended_reorder_qty = static_cast<int>(std::ceil(target_level + 50.0));
        } else if (static_cast<double>(item.available) < target_level) {
            rec.urgency_level = "HIGH";
            rec.recommended_reorder_qty = static_cast<int>(std::ceil(target_level - static_cast<double>(item.available)));
        } else if (static_cast<double>(item.available) < (target_level * 1.5)) {
            rec.urgency_level = "NORMAL";
            rec.recommended_reorder_qty = static_cast<int>(std::ceil(target_level * 0.5));
        } else {
            rec.urgency_level = "OPTIMAL";
            rec.recommended_reorder_qty = 0;
        }

        recs.push_back(rec);
    }

    return recs;
}

bool InventoryOptimizer::validateTransfer(
    int available_source_stock,
    int requested_transfer_qty
) {
    return requested_transfer_qty > 0 && available_source_stock >= requested_transfer_qty;
}

} // namespace nexus
