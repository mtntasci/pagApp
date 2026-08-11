package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.ui.components.PAGButton
import com.alafteknoloji.pagapp.ui.components.PAGButtonStyle
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SurveyFlowScreen(
    survey: SurveyMock,
    onComplete: () -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier
) {
    var currentIndex by remember { mutableIntStateOf(0) }
    var selectedOption by remember { mutableStateOf<String?>(null) }
    
    val currentQuestion = survey.questions.getOrNull(currentIndex)
    
    if (currentQuestion == null) {
        // Safety fallback
        onComplete()
        return
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Soru ${currentIndex + 1}/${survey.questions.size}",
                        style = PAGTheme.typography.title,
                        color = PAGTheme.colors.textPrimary
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onExit) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack, 
                            contentDescription = "Çıkış",
                            tint = PAGTheme.colors.textPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PAGTheme.colors.backgroundPrimary)
            )
        },
        bottomBar = {
            Box(modifier = Modifier.padding(PAGTheme.spacing.md).fillMaxWidth()) {
                val isLast = currentIndex == survey.questions.size - 1
                PAGButton(
                    title = if (isLast) "ANKETİ TAMAMLA" else "DEVAM",
                    icon = if (isLast) Icons.Filled.Check else Icons.AutoMirrored.Filled.ArrowForward,
                    style = PAGButtonStyle.Primary,
                    enabled = selectedOption != null,
                    onClick = {
                        if (isLast) {
                            onComplete()
                        } else {
                            currentIndex++
                            selectedOption = null
                        }
                    }
                )
            }
        },
        containerColor = PAGTheme.colors.backgroundPrimary
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = PAGTheme.spacing.md)
        ) {
            LinearProgressIndicator(
                progress = { (currentIndex + 1).toFloat() / survey.questions.size },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(PAGTheme.radius.pill),
                color = PAGTheme.colors.brandLime,
                trackColor = PAGTheme.colors.surfaceSecondary
            )
            
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            
            Text(
                text = currentQuestion.text,
                style = PAGTheme.typography.display,
                color = PAGTheme.colors.textPrimary
            )
            
            Spacer(modifier = Modifier.height(PAGTheme.spacing.xl))
            
            Column(verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)) {
                currentQuestion.options.forEach { option ->
                    val isSelected = selectedOption == option
                    
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = if (isSelected) PAGTheme.colors.surfaceSecondary else PAGTheme.colors.backgroundPrimary,
                                shape = PAGTheme.radius.md
                            )
                            .border(
                                width = 1.dp,
                                color = if (isSelected) PAGTheme.colors.brandLime else PAGTheme.colors.borderDefault,
                                shape = PAGTheme.radius.md
                            )
                            .clickable { selectedOption = option }
                            .padding(PAGTheme.spacing.md),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { selectedOption = option },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = PAGTheme.colors.brandLime,
                                unselectedColor = PAGTheme.colors.textMuted
                            )
                        )
                        Text(
                            text = option,
                            style = PAGTheme.typography.bodyLarge,
                            color = if (isSelected) PAGTheme.colors.textPrimary else PAGTheme.colors.textSecondary
                        )
                    }
                }
            }
        }
    }
}
