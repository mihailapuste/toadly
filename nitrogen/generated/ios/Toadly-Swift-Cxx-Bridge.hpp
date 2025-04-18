///
/// Toadly-Swift-Cxx-Bridge.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

// Forward declarations of C++ defined types
// Forward declaration of `HybridToadlySpec` to properly resolve imports.
namespace margelo::nitro::toadly { class HybridToadlySpec; }

// Forward declarations of Swift defined types
// Forward declaration of `HybridToadlySpec_cxx` to properly resolve imports.
namespace Toadly { class HybridToadlySpec_cxx; }

// Include C++ defined types
#include "HybridToadlySpec.hpp"
#include <NitroModules/Result.hpp>
#include <exception>
#include <memory>
#include <optional>
#include <string>

/**
 * Contains specialized versions of C++ templated types so they can be accessed from Swift,
 * as well as helper functions to interact with those C++ types from Swift.
 */
namespace margelo::nitro::toadly::bridge::swift {

  // pragma MARK: std::optional<std::string>
  /**
   * Specialized version of `std::optional<std::string>`.
   */
  using std__optional_std__string_ = std::optional<std::string>;
  inline std::optional<std::string> create_std__optional_std__string_(const std::string& value) {
    return std::optional<std::string>(value);
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec>`.
   */
  using std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_ = std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec>;
  std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec> create_std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_(std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_ cppType);
  
  // pragma MARK: std::weak_ptr<margelo::nitro::toadly::HybridToadlySpec>
  using std__weak_ptr_margelo__nitro__toadly__HybridToadlySpec_ = std::weak_ptr<margelo::nitro::toadly::HybridToadlySpec>;
  inline std__weak_ptr_margelo__nitro__toadly__HybridToadlySpec_ weakify_std__shared_ptr_margelo__nitro__toadly__HybridToadlySpec_(const std::shared_ptr<margelo::nitro::toadly::HybridToadlySpec>& strong) { return strong; }
  
  // pragma MARK: Result<void>
  using Result_void_ = Result<void>;
  inline Result_void_ create_Result_void_() {
    return Result<void>::withValue();
  }
  inline Result_void_ create_Result_void_(const std::exception_ptr& error) {
    return Result<void>::withError(error);
  }

} // namespace margelo::nitro::toadly::bridge::swift
