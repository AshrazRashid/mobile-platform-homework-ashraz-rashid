package com.agentapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

class NativeLoggerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NativeLogger"

    @ReactMethod
    fun writeLog(content: String) {
        val dir = reactApplicationContext.filesDir
        val file = File(dir, "app_agent_audit.log")
        try {
            FileOutputStream(file, true).use { fos ->
                fos.write("${System.currentTimeMillis()}: $content\n".toByteArray(Charsets.UTF_8))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun writeAuditExport(jsonPayload: String) {
        val dir = reactApplicationContext.filesDir
        val file = File(dir, "audit_export.json")
        try {
            FileOutputStream(file, false).use { fos ->
                fos.write(jsonPayload.toByteArray(Charsets.UTF_8))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
