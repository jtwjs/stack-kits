import type { StorybookConfig } from "@storybook/react-vite";

// 스토리는 컴포넌트 옆에 둔다(ui/<module>/<module>.stories.tsx). Storybook 설정 파일은 default export 가 규약이다.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
};

export default config;
