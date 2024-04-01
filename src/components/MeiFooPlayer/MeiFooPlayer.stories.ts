import type { Meta, StoryObj } from "@storybook/react";

import MeiFooPlayer from "./MeiFooPlayer";
import "./MeiFooPlayer.scss";

const meta: Meta<typeof MeiFooPlayer> = {
    title: "Example/MeiFooPlayer",
    component: MeiFooPlayer,
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
            // ["https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"],
            // ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
            // [
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            //     "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd",
            // ],
            // [
            //     "http://localhost:8000/videos/cam1.mp4",
            //     "http://localhost:8000/videos/cam2.mp4",
            //     "http://localhost:8000/videos/cam3.mp4",
            //     "http://localhost:8000/videos/cam4.mp4",
            //     "http://localhost:8000/videos/cam6.mp4",
            // ],
            [
                "http://localhost:8000/videos/cam1/cam1.m3u8",
                "http://localhost:8000/videos/cam2/cam2.m3u8",
                "http://localhost:8000/videos/cam3/cam3.m3u8",
                "http://localhost:8000/videos/cam4/cam4.m3u8",
                "http://localhost:8000/videos/cam6/cam6.m3u8",
            ],
    },
};
