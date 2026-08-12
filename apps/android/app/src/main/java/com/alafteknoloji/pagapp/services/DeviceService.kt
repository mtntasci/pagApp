package com.alafteknoloji.pagapp.services

import android.content.Context
import android.content.SharedPreferences
import java.util.UUID

class DeviceService(private val context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("PAGAppPrefs", Context.MODE_PRIVATE)

    val deviceId: String
        get() {
            val existing = prefs.getString("PAGAppScopedDeviceId", null)
            if (!existing.isNullOrEmpty()) {
                return existing
            }
            val newId = UUID.randomUUID().toString()
            prefs.edit().putString("PAGAppScopedDeviceId", newId).apply()
            return newId
        }

    val platform: String
        get() = "ANDROID"

    val appVersion: String
        get() {
            return try {
                val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                pInfo.versionName ?: "1.0.0"
            } catch (e: Exception) {
                "1.0.0"
            }
        }
}

private fun String?.isNull_or_empty(): Boolean = this == null || this.isEmpty()
