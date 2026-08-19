package com.alafteknoloji.pagapp.services

import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object PAGApiClient {
    var baseUrl = "https://app.pagapp.com.tr/api/v1/mobile"

    private suspend fun getAuthToken(): String? {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return null
        return try {
            val tokenResult = currentUser.getIdToken(false).await()
            tokenResult.token
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun get(endpoint: String): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl$endpoint")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.setRequestProperty("Accept", "application/json")
            conn.connectTimeout = 8000
            conn.readTimeout = 8000

            val token = getAuthToken()
            if (token != null) {
                conn.setRequestProperty("Authorization", "Bearer $token")
            }

            val responseCode = conn.responseCode
            val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
            val reader = BufferedReader(InputStreamReader(stream))
            val sb = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                sb.append(line)
            }
            reader.close()

            JSONObject(sb.toString())
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun post(endpoint: String, jsonBody: JSONObject): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl$endpoint")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.setRequestProperty("Accept", "application/json")
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.doOutput = true

            val token = getAuthToken()
            if (token != null) {
                conn.setRequestProperty("Authorization", "Bearer $token")
            }

            val writer = OutputStreamWriter(conn.outputStream)
            writer.write(jsonBody.toString())
            writer.flush()
            writer.close()

            val responseCode = conn.responseCode
            val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
            val reader = BufferedReader(InputStreamReader(stream))
            val sb = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                sb.append(line)
            }
            reader.close()

            JSONObject(sb.toString())
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
