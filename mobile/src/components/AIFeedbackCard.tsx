import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import PreciousMomentsIcon from "../assets/icons/preciousMomentsIcon.svg";
import { Typography, getFontFamilyForText } from "../styles/typography";
import { t } from "../i18n";

interface AIFeedbackCardProps {
  aiFeedback: string;
  style?: ViewStyle;
}

/**
 * AI 暖心回复组件
 * 
 * 用于展示 AI 对日记的反馈建议
 * 保持全应用统一样式：灰色背景，橙色标题，优化行高
 */
export const AIFeedbackCard: React.FC<AIFeedbackCardProps> = ({ aiFeedback, style }) => {
  if (!aiFeedback) return null;

  return (
    <View style={[styles.feedbackCard, style]}>
      <View style={styles.feedbackHeader}>
        <PreciousMomentsIcon width={20} height={20} />
        <Text
          style={[
            styles.feedbackTitle,
            {
              fontFamily: getFontFamilyForText(
                t("diary.aiFeedbackTitle"),
                "medium"
              ),
            },
          ]}
        >
          {t("diary.aiFeedbackTitle")}
        </Text>
      </View>
      <Text
        style={[
          styles.feedbackText,
          {
            fontFamily: getFontFamilyForText(
              aiFeedback,
              "regular"
            ),
          },
        ]}
      >
        {aiFeedback}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackCard: {
    backgroundColor: "#FAF6ED", // 使用日记列表页的背景色
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // 移除描边
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // 缩小间距，不要超过8px
  },
  feedbackTitle: {
    ...Typography.sectionTitle,
    fontSize: 16,
    color: "#E56C45",
    marginLeft: 8,
  },
  feedbackText: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 24, // 缩小行高为 24px
    letterSpacing: 0.3, // 增加字间距
    color: "#333333", // 稍微加深文字颜色提高对比度
  },
});
