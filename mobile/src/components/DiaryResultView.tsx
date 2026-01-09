/**
 * 日记结果展示组件
 * 
 * 用于显示处理后的日记（文字输入和语音输入共享）
 */
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PreciousMomentsIcon from "../assets/icons/preciousMomentsIcon.svg";
import { Typography, getFontFamilyForText } from "../styles/typography";
import { t } from "../i18n";

import { EmotionCapsule } from "./EmotionCapsule";
import { AIFeedbackCard } from "./AIFeedbackCard";
import { EmotionData } from "../types/emotion";

interface DiaryResultViewProps {
  title: string;
  polishedContent: string;
  aiFeedback: string;
  emotionData?: EmotionData;
  language?: string; // ✅ 新增：日记语言
  
  // 编辑相关
  isEditingTitle?: boolean;
  isEditingContent: boolean;
  editedTitle?: string;
  editedContent: string;
  
  onStartTitleEditing?: () => void;
  onStartContentEditing: () => void;
  onTitleChange?: (text: string) => void;
  onContentChange: (text: string) => void;
}

export default function DiaryResultView({
  title,
  polishedContent,
  aiFeedback,
  emotionData,
  language = "zh",
  isEditingTitle,
  isEditingContent,
  editedTitle,
  editedContent,
  onStartTitleEditing,
  onStartContentEditing,
  onTitleChange,
  onContentChange,
}: DiaryResultViewProps) {
  return (
    <>
      {/* 标题和内容卡片 */}
      <View style={styles.resultDiaryCard}>
        {/* 标题 + 情绪标签 */}
        <View style={styles.titleRow}>
          <View style={styles.resultTitleContainer}>
            {isEditingTitle ? (
              <TextInput
                style={[
                  styles.editTitleInput,
                  {
                    fontFamily: getFontFamilyForText(editedTitle || title, "bold"),
                  },
                ]}
                value={editedTitle}
                onChangeText={onTitleChange}
                autoFocus
                multiline
                placeholder={t("diary.placeholderTitle")}
                scrollEnabled={false}
                accessibilityLabel={t("diary.placeholderTitle")}
                accessibilityHint={t("accessibility.input.textHint")}
                accessibilityRole="text"
              />
            ) : (
              <TouchableOpacity
                onPress={onStartTitleEditing}
                activeOpacity={0.7}
                disabled={!onStartTitleEditing}
                accessibilityLabel={title}
                accessibilityHint={t("accessibility.button.editHint")}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.resultTitleText,
                    {
                      fontFamily: getFontFamilyForText(title, "bold"),
                    },
                  ]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ✅ 显示情绪标签 - 只要不是纯图片日记（有标题或内容）就显示 */}
          {(emotionData?.emotion || !!title || !!polishedContent) && (
            <View style={{ marginTop: 2 }}>
              <EmotionCapsule
                emotion={emotionData?.emotion}
                language={language || "en"}
                content={polishedContent}
              />
            </View>
          )}
        </View>

        {/* 内容 - 可点击编辑 */}
        {isEditingContent ? (
          <TextInput
            style={[
              styles.editContentInput,
              {
                fontFamily: getFontFamilyForText(editedContent || polishedContent, "regular"),
              },
            ]}
            value={editedContent}
            onChangeText={onContentChange}
            multiline
            autoFocus
            placeholder={t("diary.placeholderContent")}
            accessibilityLabel={t("diary.placeholderContent")}
            accessibilityHint={t("accessibility.input.textHint")}
            accessibilityRole="text"
          />
        ) : (
          <TouchableOpacity
            onPress={onStartContentEditing}
            activeOpacity={0.7}
            accessibilityLabel={polishedContent.substring(0, 100) + (polishedContent.length > 100 ? "..." : "")}
            accessibilityHint={t("accessibility.button.editHint")}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.resultContentText,
                {
                  fontFamily: getFontFamilyForText(polishedContent, "regular"),
                },
              ]}
            >
              {polishedContent}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI反馈 - 编辑时隐藏 */}
      {!isEditingTitle && !isEditingContent && !!aiFeedback && (
        <AIFeedbackCard 
          aiFeedback={aiFeedback} 
          style={styles.resultFeedbackCard}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // ===== 日记卡片 =====
  resultDiaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFE3DA", // ✅ 温暖的桃色描边，与详情页保持一致
  },

  // ✅ 新增：标题行布局
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  resultTitleContainer: {
    flex: 1,
    marginRight: 8, // ✅ 标题与标签之间的间距设为 8px
  },

  resultTitleText: {
    ...Typography.diaryTitle,
    fontSize: 18,
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },

  editTitleInput: {
    ...Typography.diaryTitle,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E56C45",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },

  resultContentText: {
    ...Typography.body,
    lineHeight: 30, // ✅ 增加 4px 行高 (从 26 增加到 30)
    color: "#1A1A1A",
    letterSpacing: 0.2,
    marginBottom: 0, // ✅ 移除底部间距
  },

  editContentInput: {
    ...Typography.body,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E56C45",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 200,
    maxHeight: 400,
    textAlignVertical: "top",
  },

  // ===== AI反馈卡片 =====
  resultFeedbackCard: {
    marginHorizontal: 0, // ✅ 外层 ScrollView 已经有 paddingHorizontal: 20
    marginBottom: 20,
  },
});

