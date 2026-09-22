#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>

namespace nexus {

enum class Currency {
    INR,
    USD,
    EUR,
    GBP,
    AED,
    JPY
};

enum class UserRole {
    SUPERADMIN,
    OWNER,
    SHOP_OWNER,
    SALES_LEAD,
    INVENTORY_MANAGER,
    FINANCE_LEAD,
    MEMBER,
    CLIENT
};

enum class WorkspaceType {
    SYSTEM,
    ENTERPRISE,
    SHOP_OWNER,
    CLIENT
};

struct UserAccount {
    int id;
    std::string name;
    std::string email;
    std::string role_str;
    UserRole role;
    WorkspaceType workspace;
    std::string company_name;
    bool is_active;
    std::string last_accessed;
};

struct OrderItem {
    int product_id;
    std::string product_name;
    std::string sku;
    int quantity;
    double unit_price;
    double line_total;
};

struct FinancialBreakdown {
    double subtotal;
    double discount_amount;
    double taxable_amount;
    double tax_rate_percent;
    double tax_amount;
    double grand_total;
    std::string currency_symbol;
};

class NexusCore {
public:
    static std::string formatCurrency(double amount, Currency curr = Currency::INR);
    static std::string roleToString(UserRole role);
    static UserRole stringToRole(const std::string& role_str);
    static std::string workspaceToString(WorkspaceType ws);
    static WorkspaceType stringToWorkspace(const std::string& ws_str);
    static std::string getTimestampIso8601();
};

} // namespace nexus
