///
/// toadlyOnLoad.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.toadly

import android.util.Log

internal class toadlyOnLoad {
  companion object {
    private const val TAG = "toadlyOnLoad"
    private var didLoad = false
    /**
     * Initializes the native part of "toadly".
     * This method is idempotent and can be called more than once.
     */
    @JvmStatic
    fun initializeNative() {
      if (didLoad) return
      try {
        Log.i(TAG, "Loading toadly C++ library...")
        System.loadLibrary("toadly")
        Log.i(TAG, "Successfully loaded toadly C++ library!")
        didLoad = true
      } catch (e: Error) {
        Log.e(TAG, "Failed to load toadly C++ library! Is it properly installed and linked? " +
                    "Is the name correct? (see `CMakeLists.txt`, at `add_library(...)`)", e)
        throw e
      }
    }
  }
}
