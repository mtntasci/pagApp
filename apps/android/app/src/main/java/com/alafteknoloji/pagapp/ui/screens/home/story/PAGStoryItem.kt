package com.alafteknoloji.pagapp.ui.screens.home.story

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.StoryItemType
import com.alafteknoloji.pagapp.models.SurveyType
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun PAGStoryItem(
    item: StoryItemType,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val ringColor = when (item) {
        is StoryItemType.Home -> PAGTheme.colors.borderDefault
        is StoryItemType.Survey -> if (item.survey.surveyType == SurveyType.PROFILE) PAGTheme.colors.brandBlue else PAGTheme.colors.borderStrong
        is StoryItemType.EarnProfileScore -> PAGTheme.colors.brandLime
    }
    
    val label = when (item) {
        is StoryItemType.Home -> "PAG"
        is StoryItemType.Survey -> item.survey.ownerName
        is StoryItemType.EarnProfileScore -> "Puan Kazan"
    }

    Column(
        modifier = modifier
            .width(72.dp)
            .clickable(onClick = onClick)
            .padding(vertical = PAGTheme.spacing.xs),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(PAGTheme.spacing.xs)
    ) {
        Box(
            modifier = Modifier
                .size(68.dp)
                .background(PAGTheme.colors.backgroundPrimary, CircleShape)
                .border(2.dp, ringColor, CircleShape)
                .padding(4.dp), // gap between ring and content
            contentAlignment = Alignment.Center
        ) {
            when (item) {
                is StoryItemType.Home -> {
                    Icon(
                        imageVector = Icons.Filled.Star,
                        contentDescription = null,
                        tint = PAGTheme.colors.textPrimary,
                        modifier = Modifier.size(32.dp)
                    )
                }
                is StoryItemType.Survey -> {
                    if (item.survey.surveyType == SurveyType.PROFILE) {
                        Icon(
                            imageVector = Icons.Filled.Person,
                            contentDescription = null,
                            tint = PAGTheme.colors.brandBlue,
                            modifier = Modifier.size(28.dp)
                        )
                    } else {
                        Text(
                            text = item.survey.ownerName.take(1).uppercase(),
                            style = PAGTheme.typography.heading,
                            color = PAGTheme.colors.textPrimary
                        )
                    }
                }
                is StoryItemType.EarnProfileScore -> {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = null,
                        tint = PAGTheme.colors.brandLime,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
        
        Text(
            text = label,
            style = PAGTheme.typography.caption,
            color = PAGTheme.colors.textPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
