#pragma once

#include <vector>
#include <string>

namespace nexus {

struct DemandPoint {
    std::string date;
    double revenue;
};

struct ForecastResult {
    double daily_revenue;
    double monthly_revenue;
    double slope;
    std::string trend;
    std::string confidence;
};

struct StockItem {
    int id;
    std::string name;
    int stock;
    int units_sold;
    double daily_demand;
    double days_remaining;
    std::string risk;
};

class Optimizer {
public:
    static ForecastResult calculateForecast(const std::vector<DemandPoint>& history);
    static std::vector<StockItem> analyzeStockRisk(const std::vector<StockItem>& items);
};

} // namespace nexus
