cmake_minimum_required(VERSION 3.15)
project(nexus_optimizer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_library(nexus_optimizer STATIC
    src/optimizer.cpp
)

target_include_directories(nexus_optimizer PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
