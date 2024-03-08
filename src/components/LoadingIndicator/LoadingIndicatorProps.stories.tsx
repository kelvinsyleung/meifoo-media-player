import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import LoadingIndicator from "./LoadingIndicator";
import "./LoadingIndicator.scss";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#ffffff",
        },
        secondary: {
            main: "#cd131c",
        },
    },
});

const meta: Meta<typeof LoadingIndicator> = {
    title: "Example/LoadingIndicator",
    component: LoadingIndicator,
    decorators: [
        (Story) => (
            <ThemeProvider theme={theme}>
                <Story />
            </ThemeProvider>
        ),
    ],
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
