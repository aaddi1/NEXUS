#include "optimizer.hpp"
#include <numeric>
#include <algorithm>
#include <cmath>

namespace nexus {

ForecastResult Optimizer::calculateForecast(const std::vector<DemandPoint>& history) {
    ForecastResult result = {0.0, 0.0, 0.0, "no-data", "low"};

    if (history.empty()) {
        return result;
    }

    std::vector<double> values;
    values.reserve(history.size());
    for (const auto& point : history) {
        values.push_back(point.revenue);
    }

    size_t window_size = std::min(static_cast<size_t>(7), values.size());
    std::vector<double> window(values.end() - window_size, values.end());

    double sum = std::accumulate(window.begin(), window.end(), 0.0);
    double average = sum / window.size();

    double slope = 0.0;
    if (window.size() > 1) {
        double n = static_cast<double>(window.size());
        double sum_i_v = 0.0;
        double sum_i = 0.0;
        double sum_i2 = 0.0;

        for (size_t i = 0; i < window.size(); ++i) {
            double idx = static_cast<double>(i);
            sum_i_v += idx * window[i];
            sum_i += idx;
            sum_i2 += idx * idx;
        }

        double denom = (n * sum_i2) - (sum_i * sum_i);
        if (std::abs(denom) > 1e-9) {
            slope = ((n * sum_i_v) - (sum_i * sum)) / denom;
        }
    }

    double prediction = std::max(0.0, average + slope);
    result.daily_revenue = std::round(prediction * 100.0) / 100.0;
    result.monthly_revenue = std::round(prediction * 30.0 * 100.0) / 100.0;
    result.slope = slope;

    double threshold = 0.01 * std::max(average, 1.0);
    if (slope > threshold) {
        result.trend = "rising";
    } else if (slope < -threshold) {
        result.trend = "falling";
    } else {
        result.trend = "stable";
    }

    if (values.size() >= 30) {
        result.confidence = "high";
    } else if (values.size() >= 7) {
        result.confidence = "medium";
    } else {
        result.confidence = "low";
    }

    return result;
}

std::vector<StockItem> Optimizer::analyzeStockRisk(const std::vector<StockItem>& items) {
    std::vector<StockItem> analyzed = items;

    for (auto& item : analyzed) {
        item.daily_demand = static_cast<double>(item.units_sold) / 30.0;

        if (item.daily_demand > 0.0) {
            item.days_remaining = std::round((static_cast<double>(item.stock) / item.daily_demand) * 10.0) / 10.0;
        } else {
            item.days_remaining = -1.0;
        }

        if (item.stock == 0) {
            item.risk = "critical";
        } else if (item.days_remaining >= 0.0 && item.days_remaining <= 7.0) {
            item.risk = "high";
        } else if (item.days_remaining >= 0.0 && item.days_remaining <= 30.0) {
            item.risk = "medium";
        } else {
            item.risk = "low";
        }
    }

    return analyzed;
}

} // namespace nexus
