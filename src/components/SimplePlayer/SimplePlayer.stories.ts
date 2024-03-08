import type { Meta, StoryObj } from "@storybook/react";

import SimplePlayer from "./SimplePlayer";
import "./SimplePlayer.scss";

const meta: Meta<typeof SimplePlayer> = {
    title: "Example/SimplePlayer",
    component: SimplePlayer,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        videoSrc:
            // "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            // "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
        isSingleViewMode: true,
    },
};
