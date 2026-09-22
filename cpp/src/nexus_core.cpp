#include "nexus_core.hpp"
#include <iomanip>
#include <sstream>
#include <ctime>
#include <algorithm>

namespace nexus {

std::string NexusCore::formatCurrency(double amount, Currency curr) {
    std::stringstream ss;
    switch (curr) {
        case Currency::INR:
            ss << "₹" << std::fixed << std::setprecision(2) << amount;
            break;
        case Currency::USD:
            ss << "$" << std::fixed << std::setprecision(2) << amount;
            break;
        case Currency::EUR:
            ss << "€" << std::fixed << std::setprecision(2) << amount;
            break;
        case Currency::GBP:
            ss << "£" << std::fixed << std::setprecision(2) << amount;
            break;
        case Currency::AED:
            ss << "AED " << std::fixed << std::setprecision(2) << amount;
            break;
        case Currency::JPY:
            ss << "¥" << std::fixed << std::setprecision(0) << amount;
            break;
    }
    return ss.str();
}

std::string NexusCore::roleToString(UserRole role) {
    switch (role) {
        case UserRole::SUPERADMIN: return "superadmin";
        case UserRole::OWNER: return "Owner";
        case UserRole::SHOP_OWNER: return "Shop Owner";
        case UserRole::SALES_LEAD: return "Sales Lead";
        case UserRole::INVENTORY_MANAGER: return "Inventory Manager";
        case UserRole::FINANCE_LEAD: return "Finance Lead";
        case UserRole::MEMBER: return "Member";
        case UserRole::CLIENT: return "Client";
    }
    return "Member";
}

UserRole NexusCore::stringToRole(const std::string& role_str) {
    std::string s = role_str;
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    if (s == "superadmin" || s == "super_admin") return UserRole::SUPERADMIN;
    if (s == "owner") return UserRole::OWNER;
    if (s == "shop owner" || s == "shop_owner") return UserRole::SHOP_OWNER;
    if (s == "sales lead" || s == "sales") return UserRole::SALES_LEAD;
    if (s == "inventory manager" || s == "inventory") return UserRole::INVENTORY_MANAGER;
    if (s == "finance lead" || s == "finance") return UserRole::FINANCE_LEAD;
    if (s == "client" || s == "customer") return UserRole::CLIENT;
    return UserRole::MEMBER;
}

std::string NexusCore::workspaceToString(WorkspaceType ws) {
    switch (ws) {
        case WorkspaceType::SYSTEM: return "system";
        case WorkspaceType::ENTERPRISE: return "enterprise";
        case WorkspaceType::SHOP_OWNER: return "shop_owner";
        case WorkspaceType::CLIENT: return "client";
    }
    return "enterprise";
}

WorkspaceType NexusCore::stringToWorkspace(const std::string& ws_str) {
    std::string s = ws_str;
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    if (s == "system") return WorkspaceType::SYSTEM;
    if (s == "shop_owner" || s == "shop") return WorkspaceType::SHOP_OWNER;
    if (s == "client") return WorkspaceType::CLIENT;
    return WorkspaceType::ENTERPRISE;
}

std::string NexusCore::getTimestampIso8601() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
#if defined(_WIN32) || defined(_WIN64)
    gmtime_s(&tm_buf, &now_c);
#else
    gmtime_r(&now_c, &tm_buf);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tm_buf);
    return std::string(buf);
}

} // namespace nexus
