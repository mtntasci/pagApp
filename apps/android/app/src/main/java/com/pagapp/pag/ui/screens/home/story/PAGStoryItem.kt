package com.pagapp.pag.ui.screens.home.story

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
import androidx.compose.foundation.Image
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import com.pagapp.pag.R
import com.pagapp.pag.models.StoryItemType
import com.pagapp.pag.models.StoryType
import com.pagapp.pag.ui.theme.PAGTheme

@Composable
fun PAGStoryItem(
    item: StoryItemType,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val ringColor = when (item) {
        is StoryItemType.Home -> PAGTheme.colors.borderDefault
        is StoryItemType.Story -> {
            if (item.story.type == StoryType.EARN_PROFILE_SCORE) PAGTheme.colors.brandLime else PAGTheme.colors.borderStrong
        }
    }
    
    val label = when (item) {
        is StoryItemType.Home -> "PAG"
        is StoryItemType.Story -> item.story.shortLabel
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
                    Image(
                        painter = painterResource(id = R.drawable.pag_symbol),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                    )
                }
                is StoryItemType.Story -> {
                    val context = LocalContext.current
                    val resId = context.resources.getIdentifier(item.story.image, "drawable", context.packageName)
                    Image(
                        painter = painterResource(id = if (resId != 0) resId else R.drawable.pag_symbol),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
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
