#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace nexus {

class CryptoEngine {
public:
    static std::string generateInvoiceSignature(
        const std::string& invoice_number,
        const std::string& secret_key
    );

    static bool verifyInvoiceSignature(
        const std::string& invoice_number,
        const std::string& provided_signature,
        const std::string& secret_key
    );

    static bool constantTimeCompare(
        const std::string& a,
        const std::string& b
    );

    static std::string sha256Hex(const std::string& input);
    static std::string hmacSha256(const std::string& key, const std::string& data);
};

} // namespace nexus
