#pragma once

#include <vector>
#include <string>
#include <map>

namespace nexus {

struct WarehouseStock {
    int product_id;
    std::string sku;
    std::string warehouse_name;
    int on_hand;
    int reserved;
    int available;
    int reorder_point;
    int safety_stock;
};

struct ReorderRecommendation {
    int product_id;
    std::string sku;
    std::string product_name;
    int current_stock;
    int daily_burn_rate;
    int lead_time_days;
    int recommended_reorder_qty;
    std::string urgency_level; // CRITICAL, HIGH, NORMAL, OPTIMAL
};

class InventoryOptimizer {
public:
    static int calculateEOQ(
        double annual_demand,
        double order_cost,
        double holding_cost_per_unit
    );

    static int calculateSafetyStock(
        double max_daily_sales,
        double avg_daily_sales,
        int max_lead_time_days,
        int avg_lead_time_days
    );

    static std::vector<ReorderRecommendation> evaluateReorders(
        const std::vector<WarehouseStock>& inventory_snapshot,
        const std::map<int, double>& product_daily_demand
    );

    static bool validateTransfer(
        int available_source_stock,
        int requested_transfer_qty
    );
};

} // namespace nexus
