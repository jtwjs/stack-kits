import type { Preview } from "@storybook/react-vite";

// 전역 데코레이터(테마·프로바이더)는 여기에 붙인다. 지금 kit 에는 없다.
const preview: Preview = {
  parameters: {
    controls: { matchers: { date: /Date$/i } },
  },
};

export default preview;
