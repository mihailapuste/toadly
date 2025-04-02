///
/// Toadly-Swift-Cxx-Bridge.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "Toadly-Swift-Cxx-Bridge.hpp"

// Include C++ implementation defined types
#include "HybridToadlySpecSwift.hpp"
#include "Toadly-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::toadly::bridge::swift {

  // pragma MARK: std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec>
  std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec> create_std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_(void* _Nonnull swiftUnsafePointer) {
    Toadly::HybridToadlySpec_cxx swiftPart = Toadly::HybridToadlySpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::toadly::HybridToadlySpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_(std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_ cppType) {
    std::shared_ptr<margelo::nitro::toadly::HybridToadlySpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::toadly::HybridToadlySpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridToadlySpec\" is not implemented in Swift!");
    }
  #endif
    Toadly::HybridToadlySpec_cxx& swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }

} // namespace margelo::nitro::toadly::bridge::swift
