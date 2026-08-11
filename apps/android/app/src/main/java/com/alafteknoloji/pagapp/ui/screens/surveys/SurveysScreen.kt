package com.alafteknoloji.pagapp.ui.screens.surveys

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.SurveyCategory
import com.alafteknoloji.pagapp.models.SurveyMock
import com.alafteknoloji.pagapp.ui.components.SurveyCard
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun SurveysScreen(
    onNavigateToDetail: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedCategory by remember { mutableStateOf(SurveyCategory.FOR_YOU) }
    val categories = listOf(SurveyCategory.FOR_YOU, SurveyCategory.NEW, SurveyCategory.COMPLETED)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        // Category Tabs
        LazyRow(
            contentPadding = PaddingValues(horizontal = PAGTheme.spacing.md, vertical = PAGTheme.spacing.sm),
            horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
        ) {
            items(categories) { category ->
                val isSelected = selectedCategory == category
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (isSelected) PAGTheme.colors.brandMidnight else Color.Transparent)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color.Transparent else PAGTheme.colors.borderDefault,
                            shape = CircleShape
                        )
                        .clickable { selectedCategory = category }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = category.title,
                        style = PAGTheme.typography.bodyLarge,
                        color = if (isSelected) PAGTheme.colors.brandLime else PAGTheme.colors.textSecondary
                    )
                }
            }
        }

        // List
        val filtered = remember(selectedCategory) { SurveyMock.sampleList.filter { it.category == selectedCategory } }
        
        if (filtered.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(top = 40.dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Text(
                    text = "Bu kategoride anket bulunmuyor.",
                    style = PAGTheme.typography.body,
                    color = PAGTheme.colors.textMuted
                )
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(PAGTheme.spacing.md),
                verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.md)
            ) {
                items(filtered) { survey ->
                    SurveyCard(
                        survey = survey,
                        onTakeSurvey = { onNavigateToDetail(survey.id) }
                    )
                }
            }
        }
    }
}
