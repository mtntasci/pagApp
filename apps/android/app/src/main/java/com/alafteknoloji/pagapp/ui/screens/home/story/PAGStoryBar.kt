package com.alafteknoloji.pagapp.ui.screens.home.story

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Divider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.alafteknoloji.pagapp.models.StoryItemType
import com.alafteknoloji.pagapp.ui.theme.PAGTheme

@Composable
fun PAGStoryBar(
    items: List<StoryItemType>,
    onSelect: (StoryItemType) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(PAGTheme.colors.backgroundPrimary)
    ) {
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = PAGTheme.spacing.sm),
            horizontalArrangement = Arrangement.spacedBy(PAGTheme.spacing.sm)
        ) {
            items(items) { item ->
                PAGStoryItem(
                    item = item,
                    onClick = { onSelect(item) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(PAGTheme.spacing.sm))
        
        Divider(
            color = PAGTheme.colors.borderDefault,
            thickness = 1.dp
        )
    }
}
