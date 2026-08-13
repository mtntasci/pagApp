package com.alafteknoloji.pagapp.ui.screens.profile

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.alafteknoloji.pagapp.services.PAGProfileQuestion
import com.alafteknoloji.pagapp.services.PAGProfileQuestionAnswer
import com.alafteknoloji.pagapp.services.ProfileSurveyService
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSurveysScreen(
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val service = remember { ProfileSurveyService.getInstance(context) }
    val scope = rememberCoroutineScope()

    val unansweredQuestions by service.unansweredQuestions.collectAsState()
    val answeredQuestions by service.answeredQuestions.collectAsState()
    val availableScoreX by service.availableScoreX.collectAsState()
    val hasMoreUnanswered by service.hasMoreUnanswered.collectAsState()
    val isLoading by service.isLoading.collectAsState()
    val isSubmitting by service.isSubmitting.collectAsState()
    val lastBatchScoreAwarded by service.lastBatchScoreAwarded.collectAsState()

    val selectedAnswers = remember { mutableStateMapOf<String, String>() }
    var showBatchResultDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        service.fetchProfileQuestions(3)
        service.fetchAnsweredQuestions()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ek Profil Soruları", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Geri")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        containerColor = Color(0xFF0F172A)
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Header Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Profilini Güçlendir",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "Ek soruları yanıtlayarak Profile Score kazan",
                            color = Color.LightGray,
                            fontSize = 13.sp
                        )
                    }

                    if (availableScoreX > 0) {
                        Surface(
                            color = Color(0xFFCCFF00),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = "+$availableScoreX Puan",
                                color = Color(0xFF0F172A),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            // Unanswered Questions (Max 3 Batch)
            if (isLoading) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color(0xFFCCFF00))
                    }
                }
            } else if (unansweredQuestions.isEmpty()) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFFCCFF00),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Tebrikler! Tüm yeni profil sorularını tamamladınız.",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Aşağıdaki 'Daha Önce Yanıtladıklarım' bölümünden yanıtlarınızı istediğiniz zaman güncelleyebilirsiniz.",
                                color = Color.LightGray,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            } else {
                itemsIndexed(unansweredQuestions) { index, question ->
                    UnansweredQuestionCardItem(
                        question = question,
                        index = index + 1,
                        total = unansweredQuestions.size,
                        selectedOptionId = selectedAnswers[question.id],
                        onOptionSelect = { optId ->
                            selectedAnswers[question.id] = optId
                        }
                    )
                }

                item {
                    val isComplete = selectedAnswers.size == unansweredQuestions.size
                    Button(
                        onClick = {
                            scope.launch {
                                val ok = service.submitBatchAnswers(selectedAnswers)
                                if (ok) {
                                    selectedAnswers.clear()
                                    showBatchResultDialog = true
                                }
                            }
                        },
                        enabled = isComplete && !isSubmitting,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFCCFF00),
                            disabledContainerColor = Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                color = Color(0xFF0F172A),
                                modifier = Modifier.size(24.dp)
                            )
                        } else {
                            Text(
                                text = "Cevapları Gönder & Puan Kazan",
                                color = if (isComplete) Color(0xFF0F172A) else Color.Gray,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            }

            item { Divider(color = Color(0xFF334155)) }

            // Answered Questions Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Daha Önce Yanıtladıklarım",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${answeredQuestions.size} Yanıt",
                        color = Color.LightGray,
                        fontSize = 13.sp
                    )
                }
            }

            if (answeredQuestions.isEmpty()) {
                item {
                    Text(
                        text = "Henüz önceden yanıtladığınız bir profil sorusu yok.",
                        color = Color.Gray,
                        fontSize = 13.sp
                    )
                }
            } else {
                itemsIndexed(answeredQuestions) { _, item ->
                    AnsweredQuestionCardItem(
                        item = item,
                        onOptionUpdate = { qId, optId ->
                            scope.launch {
                                service.updateAnswer(qId, optId)
                            }
                        }
                    )
                }
            }
        }
    }

    // Result Dialog with "Yorulmadım, Devam" CTA
    if (showBatchResultDialog) {
        Dialog(onDismissRequest = { showBatchResultDialog = false }) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF1E293B),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = Color(0xFFCCFF00),
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Tebrikler!",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Bu oturumda +$lastBatchScoreAwarded Profil Puanı kazandınız!",
                        color = Color(0xFFCCFF00),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    if (hasMoreUnanswered) {
                        Text(
                            text = "Yanıtlayabileceğiniz yeni profil soruları bulunmaktadır.",
                            color = Color.LightGray,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                showBatchResultDialog = false
                                scope.launch {
                                    service.fetchProfileQuestions(3)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFCCFF00)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                        ) {
                            Text(
                                text = "Yorulmadım, Devam",
                                color = Color(0xFF0F172A),
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    TextButton(onClick = { showBatchResultDialog = false }) {
                        Text(text = "Şimdilik Tamam", color = Color.LightGray)
                    }
                }
            }
        }
    }
}

@Composable
fun UnansweredQuestionCardItem(
    question: PAGProfileQuestion,
    index: Int,
    total: Int,
    selectedOptionId: String?,
    onOptionSelect: (String) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Soru $index / $total",
                    color = Color(0xFFCCFF00),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Text(
                    text = "+${question.profileScoreReward} Puan",
                    color = Color.LightGray,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = question.questionText,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                question.options.forEach { opt ->
                    val isSelected = selectedOptionId == opt.optionId
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                if (isSelected) Color(0xFFCCFF00).copy(alpha = 0.15f) else Color(
                                    0xFF0F172A
                                )
                            )
                            .border(
                                width = 1.dp,
                                color = if (isSelected) Color(0xFFCCFF00) else Color(0xFF334155),
                                shape = RoundedCornerShape(8.dp)
                            )
                            .clickable { onOptionSelect(opt.optionId) }
                            .padding(12.dp)
                    ) {
                        Text(
                            text = opt.label,
                            color = Color.White,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AnsweredQuestionCardItem(
    item: PAGProfileQuestionAnswer,
    onOptionUpdate: (String, String) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Surface(
                    color = Color(0xFF334155),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = item.categoryName,
                        color = Color.LightGray,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = "Cevaplandı",
                    color = Color(0xFF22C55E),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = item.questionText,
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(10.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                item.options.forEach { opt ->
                    val isSelected = item.selectedOptionId == opt.optionId
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(6.dp))
                            .background(
                                if (isSelected) Color(0xFF22C55E).copy(alpha = 0.15f) else Color(
                                    0xFF0F172A
                                )
                            )
                            .clickable { onOptionUpdate(item.questionId, opt.optionId) }
                            .padding(10.dp)
                    ) {
                        Text(
                            text = opt.label,
                            color = Color.White,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}
