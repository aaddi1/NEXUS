cmake_minimum_required(VERSION 3.15)
project(nexus_engine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Static Library for Nexus Computational Engine
add_library(nexus_engine STATIC
    src/nexus_core.cpp
    src/pricing_engine.cpp
    src/inventory_optimizer.cpp
    src/crypto_engine.cpp
    src/optimizer.cpp
)

target_include_directories(nexus_engine PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Standalone Executable Engine
add_executable(nexus_cpp_engine
    src/main.cpp
)

target_link_libraries(nexus_cpp_engine PRIVATE nexus_engine)
