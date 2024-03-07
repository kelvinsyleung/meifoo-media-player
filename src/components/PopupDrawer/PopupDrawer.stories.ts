import type { Meta, StoryObj } from "@storybook/react";

import PopupDrawer from "./PopupDrawer";
import "./PopupDrawer.scss";

const meta: Meta<typeof PopupDrawer> = {
    title: "Example/PopupDrawer",
    component: PopupDrawer,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        on: true,
    },
};
