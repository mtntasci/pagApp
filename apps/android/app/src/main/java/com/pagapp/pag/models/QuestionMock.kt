package com.pagapp.pag.models

import java.util.UUID

data class QuestionMock(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val options: List<String>
)
