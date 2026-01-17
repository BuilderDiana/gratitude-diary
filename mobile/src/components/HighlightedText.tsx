import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface HighlightedTextProps {
  /**
   * 要显示的文本
   */
  text: string;
  
  /**
   * 搜索关键词（用于高亮）
   */
  searchQuery: string;
  
  /**
   * 文本样式
   */
  style?: StyleProp<TextStyle>;
  
  /**
   * 高亮部分的样式
   */
  highlightStyle?: StyleProp<TextStyle>;
  
  /**
   * 最大行数
   */
  numberOfLines?: number;
}

/**
 * 带搜索关键词高亮的文本组件
 * 
 * 用法:
 * <HighlightedText 
 *   text="今天去了北京旅行" 
 *   searchQuery="旅行"
 *   style={styles.text}
 * />
 */
export function HighlightedText({
  text,
  searchQuery,
  style,
  highlightStyle,
  numberOfLines,
}: HighlightedTextProps) {
  // 如果没有搜索词，直接显示原文
  if (!searchQuery || searchQuery.trim() === '') {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  // 如果文本为空，返回空
  if (!text) {
    return <Text style={style} numberOfLines={numberOfLines}></Text>;
  }

  try {
    // 转义特殊正则字符
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 分割文本（忽略大小写）
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part, index) => {
          // 检查是否匹配（忽略大小写）
          const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
          
          return isMatch ? (
            <Text
              key={index}
              style={[
                highlightStyle || {
                  backgroundColor: '#FFE5B4', // 浅橙色背景
                  color: '#FF6B35', // 深橙色文字
                  fontWeight: '600',
                },
              ]}
            >
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          );
        })}
      </Text>
    );
  } catch (error) {
    // 正则表达式错误时，显示原文
    console.warn('HighlightedText 错误:', error);
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }
}
