import type { Meta, StoryObj } from "@storybook/react";

import VolumePopup from "./VolumePopup";
import "./VolumePopup.scss";

const meta: Meta<typeof VolumePopup> = {
    title: "Example/VolumePopup",
    component: VolumePopup,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        isDisplaying: true,
    },
};
