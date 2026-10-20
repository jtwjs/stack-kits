import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { draftArticle, publishedArticle } from "../../fixtures";
import { ArticleList } from "./article-list";

const meta = {
  title: "entities/article/ArticleList",
  component: ArticleList,
} satisfies Meta<typeof ArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  args: { articles: [publishedArticle, draftArticle] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("첫 기사")).toBeVisible();
    await expect(canvas.getByText("2026-01-02 00:30")).toBeVisible();
  },
};

export const Empty: Story = {
  name: "빈 목록",
  args: { articles: [] },
};

export const LongTitle: Story = {
  name: "긴 제목",
  args: {
    articles: [
      {
        ...publishedArticle,
        title:
          "아주 긴 기사 제목이 한 줄을 넘어갈 때 줄바꿈과 말줄임이 어떻게 보이는지 확인하는 예시 제목입니다".repeat(
            2,
          ),
      },
    ],
  },
};
